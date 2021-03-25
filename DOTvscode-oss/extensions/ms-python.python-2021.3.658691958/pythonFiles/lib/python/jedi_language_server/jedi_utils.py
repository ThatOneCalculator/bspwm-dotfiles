"""Utilities to work with Jedi.

Translates pygls types back and forth with Jedi
"""

import random
import string  # pylint: disable=deprecated-module
from inspect import Parameter
from typing import Dict, List

import jedi.api.errors
import jedi.inference.references
import jedi.settings
from jedi import Project, Script
from jedi.api.classes import Completion, Name, ParamName, Signature
from pygls.types import (
    CompletionItem,
    CompletionItemKind,
    Diagnostic,
    DiagnosticSeverity,
    DocumentSymbol,
    InsertTextFormat,
    Location,
    MarkupContent,
    MarkupKind,
    Position,
    Range,
    SymbolInformation,
    SymbolKind,
)
from pygls.uris import from_fs_path
from pygls.workspace import Document

from .initialize_params_parser import InitializeParamsParser
from .type_map import get_lsp_completion_type, get_lsp_symbol_type


def set_jedi_settings(  # pylint: disable=invalid-name
    ip: InitializeParamsParser,
) -> None:
    """Sets jedi settings."""
    jedi.settings.auto_import_modules = list(
        set(
            jedi.settings.auto_import_modules
            + ip.initializationOptions_jediSettings_autoImportModules
        )
    )


def script(project: Project, document: Document) -> Script:
    """Simplifies getting jedi Script."""
    return Script(code=document.source, path=document.path, project=project)


def lsp_range(name: Name) -> Range:
    """Get LSP range from Jedi definition.

    - jedi is 1-indexed for lines and 0-indexed for columns
    - LSP is 0-indexed for lines and 0-indexed for columns
    - Therefore, subtract 1 from Jedi's definition line
    """
    return Range(
        start=Position(line=name.line - 1, character=name.column),
        end=Position(
            line=name.line - 1,
            character=name.column + len(name.name),
        ),
    )


def lsp_location(name: Name) -> Location:
    """Get LSP location from Jedi definition."""
    return Location(uri=from_fs_path(name.module_path), range=lsp_range(name))


def lsp_symbol_information(name: Name) -> SymbolInformation:
    """Get LSP SymbolInformation from Jedi definition."""
    return SymbolInformation(
        name=name.name,
        kind=get_lsp_symbol_type(name.type),
        location=lsp_location(name),
        container_name=(
            "None" if name is None else (name.full_name or name.name or "None")
        ),
    )


def _document_symbol_range(name: Name) -> Range:
    """Get accurate full range of function.

    Thanks <https://github.com/CXuesong> from
    <https://github.com/palantir/python-language-server/pull/537/files> for the
    inspiration!

    Note: I add tons of extra space to make dictionary completions work. Jedi
    cuts off the end sometimes before the final function statement. This may be
    the cause of bugs at some point.
    """
    start = name.get_definition_start_position()
    end = name.get_definition_end_position()
    if start is None or end is None:
        return lsp_range(name)
    (start_line, start_column) = start
    (end_line, end_column) = end
    return Range(
        start=Position(start_line - 1, start_column),
        end=Position(end_line - 1, end_column),
    )


def lsp_document_symbols(names: List[Name]) -> List[DocumentSymbol]:
    """Get hierarchical symbols.

    We do some cleaning here. Names from scopes that aren't directly
    accessible with dot notation are removed from display. See comments
    inline for cleaning steps.
    """
    _name_lookup: Dict[Name, DocumentSymbol] = {}
    results: List[DocumentSymbol] = []
    for name in names:
        symbol = DocumentSymbol(
            name=name.name,
            kind=get_lsp_symbol_type(name.type),
            range=_document_symbol_range(name),
            selection_range=lsp_range(name),
            children=[],
        )
        parent = name.parent()
        if parent.type == "module":
            # add module-level variables to list
            results.append(symbol)
            if name.type == "class":
                # if they're a class, they can also be a namespace
                _name_lookup[name] = symbol
        elif (
            parent.type == "class"
            and name.type == "function"
            and name.name in {"__init__"}
        ):
            # special case for __init__ method in class; names defined here
            symbol.kind = SymbolKind.Method
            _name_lookup[parent].children.append(symbol)  # type: ignore
            _name_lookup[name] = symbol
        elif parent not in _name_lookup:
            # unqualified names are not included in the tree
            continue
        elif name.is_side_effect() and name.get_line_code().strip().startswith(
            "self."
        ):
            # handle attribute creation on __init__ method
            symbol.kind = SymbolKind.Property
            _name_lookup[parent].children.append(symbol)  # type: ignore
        elif parent.type == "class":
            # children are added for class scopes
            if name.type == "function":
                # No way to identify @property decorated items. That said, as
                # far as code is concerned, @property-decorated items should be
                # considered "methods" since do more than just assign a value.
                symbol.kind = SymbolKind.Method
            else:
                symbol.kind = SymbolKind.Property
            _name_lookup[parent].children.append(symbol)  # type: ignore
    return results


def lsp_diagnostic(error: jedi.api.errors.SyntaxError) -> Diagnostic:
    """Get LSP Diagnostic from Jedi SyntaxError."""
    return Diagnostic(
        range=Range(
            start=Position(line=error.line - 1, character=error.column),
            end=Position(
                line=error.until_line - 1, character=error.until_column
            ),
        ),
        message=error.get_message(),
        severity=DiagnosticSeverity.Error,
        source="jedi",
    )


def line_column(jedi_script: Script, position: Position) -> Dict[str, int]:
    """Translate pygls Position to Jedi's line/column.

    Returns a dictionary because this return result should be unpacked as a
    function argument to Jedi's functions.

    Jedi is 1-indexed for lines and 0-indexed for columns. LSP is 0-indexed for
    lines and 0-indexed for columns. Therefore, add 1 to LSP's request for the
    line.

    Note: as of version 3.15, LSP's treatment of "position" conflicts with
    Jedi in some cases. According to the LSP docs:

        Character offset on a line in a document (zero-based). Assuming that
        the line is represented as a string, the `character` value represents
        the gap between the `character` and `character + 1`.

        If the character value is greater than the line length it defaults back
        to the line length.

    Sources:
    https://microsoft.github.io/language-server-protocol/specification#position
    https://github.com/palantir/python-language-server/pull/201/files
    """
    lines = jedi_script._code_lines  # pylint: disable=protected-access
    line_length = len(lines[position.line])
    return dict(
        line=position.line + 1,
        column=min(position.character, line_length - 1),
    )


def line_column_range(pygls_range: Range) -> Dict[str, int]:
    """Translate pygls range to Jedi's line/column/until_line/until_column.

    Returns a dictionary because this return result should be unpacked as a
    function argument to Jedi's functions.

    Jedi is 1-indexed for lines and 0-indexed for columns. LSP is 0-indexed for
    lines and 0-indexed for columns. Therefore, add 1 to LSP's request for the
    line.
    """
    return dict(
        line=pygls_range.start.line + 1,
        column=pygls_range.start.character,
        until_line=pygls_range.end.line + 1,
        until_column=pygls_range.end.character,
    )


def compare_names(name1: Name, name2: Name) -> bool:
    """Check if one Name is equal to another.

    This function, while trivial, is useful for documenting types
    without needing to directly import anything from jedi into
    `server.py`
    """
    return name1 == name2


def complete_sort_name(name: Completion) -> str:
    """Return sort name for a jedi completion.

    Should be passed to the sortText field in CompletionItem. Strings sort a-z,
    a comes first and z comes last.

    Additionally, we'd like to keep the sort order to what Jedi has provided.
    For this reason, we make sure the sort-text is just a letter and not the
    name itself.
    """
    if name.type == "param" and name.name.endswith("="):
        return "a"
    return "z"


def clean_completion_name(name: str, char_before_cursor: str) -> str:
    """Clean the completion name, stripping bad surroundings.

    1. Remove all surrounding " and '. For
    """
    if char_before_cursor in {"'", '"'}:
        return name.lstrip(char_before_cursor)
    return name


_POSITION_PARAMETERS = {
    Parameter.POSITIONAL_ONLY,
    Parameter.POSITIONAL_OR_KEYWORD,
}

_PARAM_NAME_IGNORE = {"/", "*"}


def get_snippet_signature(signature: Signature) -> str:
    """Return the snippet signature."""
    params: List[ParamName] = signature.params
    if not params:
        return "()$0"
    signature_list = []
    count = 1
    for param in params:
        param_name = param.name
        if param_name in _PARAM_NAME_IGNORE:
            continue
        if param.kind in _POSITION_PARAMETERS:
            param_str = param.to_string()
            if "=" in param_str:  # hacky default argument check
                break
            result = "${" + f"{count}:{param_name}" + "}"
            signature_list.append(result)
            count += 1
            continue
        if param.kind == Parameter.KEYWORD_ONLY:
            result = param_name + "=${" + f"{count}:..." + "}"
            signature_list.append(result)
            count += 1
            continue
    if not signature_list:
        return "($0)"
    return "(" + ", ".join(signature_list) + ")$0"


def is_import(script_: Script, line: int, column: int) -> bool:
    """Check whether a position is a Jedi import.

    `line` and `column` are Jedi lines and columns

    NOTE: this function is a bit of a hack and should be revisited with each
    Jedi release. Additionally, it doesn't really work for manually-triggered
    completions, without any text, which will may cause issues for users with
    manually triggered completions.
    """
    # pylint: disable=protected-access
    tree_name = script_._module_node.get_name_of_position((line, column))
    if tree_name is None:
        return False
    name = script_._get_module_context().create_name(tree_name)
    if name is None:
        return False
    return name.is_import()


_LSP_TYPE_FOR_SNIPPET = {
    CompletionItemKind.Class,
    CompletionItemKind.Function,
}


def lsp_completion_item(
    name: Completion,
    char_before_cursor: str,
    enable_snippets: bool,
    markup_kind: MarkupKind,
) -> CompletionItem:
    """Using a Jedi completion, obtain a jedi completion item."""
    name_name = name.name
    name_clean = clean_completion_name(name_name, char_before_cursor)
    lsp_type = get_lsp_completion_type(name.type)
    completion_item = CompletionItem(
        label=name_name,
        filter_text=name_name,
        kind=lsp_type,
        detail=name.description,
        documentation=MarkupContent(kind=markup_kind, value=name.docstring()),
        sort_text=complete_sort_name(name),
        insert_text=name_clean,
        insert_text_format=InsertTextFormat.PlainText,
    )
    if not enable_snippets:
        return completion_item
    if lsp_type not in _LSP_TYPE_FOR_SNIPPET:
        return completion_item

    signatures = name.get_signatures()
    if not signatures:
        return completion_item

    try:
        snippet_signature = get_snippet_signature(signatures[0])
    except Exception:  # pylint: disable=broad-except
        return completion_item
    new_text = name_name + snippet_signature
    completion_item.insertText = new_text
    completion_item.insertTextFormat = InsertTextFormat.Snippet
    return completion_item


def random_var(
    beginning: str,
    random_length: int = 8,
    letters: str = string.ascii_lowercase,
) -> str:
    """Generate a random variable name.

    Useful for refactoring functions
    """
    ending = "".join(random.choice(letters) for _ in range(random_length))
    return beginning + ending

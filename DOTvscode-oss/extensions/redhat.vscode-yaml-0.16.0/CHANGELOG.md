### 0.16.0

- CodeAction to open json schema from yaml error [#395](https://github.com/redhat-developer/yaml-language-server/pull/395)
- Upgrade to `4.0.2` vscode-json-languageservice  [#405](https://github.com/redhat-developer/yaml-language-server/issues/405)
- feat: add ability to delete all schemas from cache [#397](https://github.com/redhat-developer/yaml-language-server/pull/397)
- feat: multiple schema distinction in validation [#410](https://github.com/redhat-developer/yaml-language-server/pull/410)
- Fix: Object autocompletion in arrays with custom indentation produces invalid output [#432](https://github.com/redhat-developer/vscode-yaml/issues/432)
- Fix: Auto completing an object underneath an array can produce the wrong indentation [#392](https://github.com/redhat-developer/yaml-language-server/issues/392)
- CodeAction to convert Tab characters to spaces [#416](https://github.com/redhat-developer/yaml-language-server/pull/416)
- Fix: Incorrect Matching Against Schema Store [#354](https://github.com/redhat-developer/vscode-yaml/issues/354)
- Fix: Uses the wrong schema, even when yaml.schemas is set [#397](https://github.com/redhat-developer/vscode-yaml/issues/397)
- feat: add new params to completion snippet [#388](https://github.com/redhat-developer/yaml-language-server/pull/388)
- Fix: Runtime warning on configuration loading [#436](https://github.com/redhat-developer/vscode-yaml/pull/436)

Thanks to Petr Spacek and Sorin Sbarnea

### 0.15.0

- Fix: Array new line ending with no indent [#384](https://github.com/redhat-developer/yaml-language-server/pull/384)
- Fix: Code Completion with defaultSnippet and markdown [#385](https://github.com/redhat-developer/yaml-language-server/pull/385)
- Fix: Test yaml-schema package [#386](https://github.com/redhat-developer/yaml-language-server/pull/386)
- Fix: Completion with default snippet when node is array [#387](https://github.com/redhat-developer/yaml-language-server/pull/387)
- Auto formatting for list, with `onTypeFormatting` implementation [#179](https://github.com/redhat-developer/vscode-yaml/issues/179)
- Fix: Completion array anyOf [#390](https://github.com/redhat-developer/yaml-language-server/pull/390)
- Fix CodeCompletion with defaultSnippet and markdown [#393](https://github.com/redhat-developer/yaml-language-server/pull/393)
- Update kubernetes schema to 1.18.1 [#401](https://github.com/redhat-developer/yaml-language-server/pull/401)
- Fix: Folding misbehaves in version 0.14.0 [#400](https://github.com/redhat-developer/yaml-language-server/issues/400)
- Add backtick to surroundingPairs [#144](https://github.com/redhat-developer/vscode-yaml/issues/144)
- Fix: Extension is stealing focus [#359](https://github.com/redhat-developer/vscode-yaml/issues/359)

Thanks to Petr Spacek and tonypai for contribution in `yaml-language-server`

### 0.14.0

- yaml-language-server use a non-standard LSP request to resolve schemas content on client [#359](https://github.com/redhat-developer/yaml-language-server/pull/359)
- Add in non-standard lsp request for resolving schemas on the client-side [#395](https://github.com/redhat-developer/vscode-yaml/pull/395)
- Fix error on completion 'null' value [#360](https://github.com/redhat-developer/yaml-language-server/pull/360)
- Select schemas based of on their priority [#362](https://github.com/redhat-developer/yaml-language-server/pull/362)
- Keep space before word after inserting completion [#363](https://github.com/redhat-developer/yaml-language-server/pull/363)
- Update readme with example of an array of glob patterns for schema [#366](https://github.com/redhat-developer/yaml-language-server/pull/366)
- Add Dockerfile [#335](https://github.com/redhat-developer/yaml-language-server/issues/335)
- Fix: Code completion list empty on empty file [#349](https://github.com/redhat-developer/vscode-yaml/issues/349)
- Fix: Autocompletion missing space in value for default snippets when autocompleting on root node [#364](https://github.com/redhat-developer/yaml-language-server/issues/364)
- Check if dynamic registration is enabled before executing onDidChangeWorkspaceFolders [#378](https://github.com/redhat-developer/yaml-language-server/pull/378)
- Fix: Array indentation in autocomplete is broken after upgrade to 0.13 [#376](https://github.com/redhat-developer/yaml-language-server/issues/376)
- Added folding ranges provider implementation [#337](https://github.com/redhat-developer/yaml-language-server/issues/337)
- Fix: Hover doesn't work when there is no symbol after property [#382](https://github.com/redhat-developer/yaml-language-server/pull/382)
- Fix: Code completion array new line ending with no indent [#384](https://github.com/redhat-developer/yaml-language-server/pull/384)
- Fix: Code completion with defaultSnippet and markdown [#385](https://github.com/redhat-developer/yaml-language-server/pull/385)

### 0.13.0

- Improve 'hover' with complex k8s schemas [#347](https://github.com/redhat-developer/yaml-language-server/pull/347)
- Allow array for fileMatch in yamlValidation contribution, now this property complies with `contributes.jsonValidation` [#348](https://github.com/redhat-developer/yaml-language-server/pull/348)
- yaml-language-server now compatible with the newest version of vscode-json-languageservice. [#350](https://github.com/redhat-developer/yaml-language-server/pull/350)
- Fix: If blocks don't evaluate properties correctly [#393](https://github.com/redhat-developer/vscode-yaml/issues/393)

#### 0.12.0

- Fix: Error when file has "Type" attribute [#317](https://github.com/redhat-developer/yaml-language-server/issues/317)
- Added all user settings in to README.md [#334](https://github.com/redhat-developer/yaml-language-server/pull/334)
- Added schema information (schema title or URL) to diagnostic [#310](https://github.com/redhat-developer/yaml-language-server/issues/310)
- Fix: autogenerated snippet for keys that contain an array of objects is badly indented [#329](https://github.com/redhat-developer/yaml-language-server/issues/329)
- Fix: example string of type integer gets pasted as int [#371](https://github.com/redhat-developer/vscode-yaml/issues/371)
- Fix: Auto completion can't suggest string enums correctly in Flow Style content. [#239](https://github.com/redhat-developer/yaml-language-server/issues/239)

#### 0.11.1

- Fix: Latest version breaks auto-save formatting [#366](https://github.com/redhat-developer/vscode-yaml/issues/366)

#### 0.11.0

- Fix: `yaml.schemas` configuration doesn't work on windows with full path [#347](https://github.com/redhat-developer/vscode-yaml/issues/347)
- Completion text use space instead of tab for indentation [#283](https://github.com/redhat-developer/yaml-language-server/issues/283)
- YAML Schemas can now be used for validation [#318](https://github.com/redhat-developer/yaml-language-server/pull/318)

#### 0.10.1

- Fix for cannot read property 'lineComments' of undefined Code: -32603 [#312](https://github.com/redhat-developer/vscode-yaml/issues/358)

#### 0.10.0

- Log all errors in to 'YAML Support' output channel [#327](https://github.com/redhat-developer/vscode-yaml/pull/327)
- Fixed bug, when if a registeredContributor of schema provider is throwing an error, it is forbidding other registered schema providers to work [#323](https://github.com/redhat-developer/vscode-yaml/issues/323)
- Add label for scheme contributions, with this label extension can override schemes contributed by other extension [#315](https://github.com/redhat-developer/vscode-yaml/pull/315)
- Allows to declare a schema inside the yaml file through modeline `# yaml-language-server: $schema=<urlOfTheSchema>` [#280](https://github.com/redhat-developer/yaml-language-server/pull/280)
- Insert empty string instead of 'null' for string array completion [#277](https://github.com/redhat-developer/yaml-language-server/pull/277)
- Handle workspace/workspaceFolders event for multi root workspaces [#281](https://github.com/redhat-developer/yaml-language-server/pull/281)
- Provide default object as completion snippet [#291] https://github.com/redhat-developer/yaml-language-server/pull/291
- Add validation of date and time formats [#292](https://github.com/redhat-developer/yaml-language-server/pull/292)
- Fix document symbols computation if yaml has complex mappings [#293](https://github.com/redhat-developer/yaml-language-server/pull/293)

#### 0.9.1

- Fixed issues with the release process

#### 0.9.0

- Improve Diagnostic positions [#260](https://github.com/redhat-developer/yaml-language-server/issues/260)
- Support `maxProperties` when providing completion [#269](https://github.com/redhat-developer/yaml-language-server/issues/269)
- Fix for required attributes are inserted with wrong level of indentation on first array item [redhat-developer/vscode-yaml#312](https://github.com/redhat-developer/vscode-yaml/issues/312)
- Use https endpoints for schemastore [#PR](https://github.com/redhat-developer/yaml-language-server/pull/264)

#### 0.8.0

- Support for textDocument/findDefinition [#PR](https://github.com/redhat-developer/yaml-language-server/pull/257)
- Fix kubernetes schema back to 1.17.0 [#PR](https://github.com/redhat-developer/yaml-language-server/pull/236)
- Fix for @ symbol in relative path [#PR](https://github.com/redhat-developer/yaml-language-server/pull/254)
- Fix for null literals [#118](https://github.com/redhat-developer/yaml-language-server/issues/118)
- Fix for autocompletion on default values [#281](https://github.com/redhat-developer/vscode-yaml/issues/281)

#### 0.7.2

- Fix the way default snippets is handled when we have boolean values [#PR](https://github.com/redhat-developer/yaml-language-server/pull/234)

#### 0.7.1

- Allow contributor API to contribute multiple schemas for the same file [#PR](https://github.com/redhat-developer/yaml-language-server/pull/227)
- Fix issue with arrays in default snippets [#PR](https://github.com/redhat-developer/yaml-language-server/pull/226)

#### 0.7.0

- Updates kubernetes schema to 1.17.0 [#Commit](https://github.com/redhat-developer/yaml-language-server/commit/68d0f395ccc12abf9f180fa39ce49b77d52863ad)
- Added API for modifiying schemas in memory [#151](https://github.com/redhat-developer/yaml-language-server/issues/151)
- Updated yaml completion to use JSON 7 Parser [#150](https://github.com/redhat-developer/yaml-language-server/issues/150)
- Server side snippet support [#205](https://github.com/redhat-developer/yaml-language-server/issues/205)
- Fix issue with language server not issuing warnings on duplicate keys [#Commit](https://github.com/redhat-developer/yaml-language-server/commit/20a8b07cd8f054d1374cbab17ef479320ac5669c)
- Fix for collecting completion items if array contains objects [#PR](https://github.com/redhat-developer/yaml-language-server/pull/224)
- Fix for merge key error with JSON Schema [#PR](https://github.com/redhat-developer/yaml-language-server/pull/222)

#### 0.6.1

- Fix for setting kubernetes in yaml.schemas gives error [#202](https://github.com/redhat-developer/yaml-language-server/issues/202)

#### 0.6.0

- Fix for schema sequence custom property [#PR](https://github.com/redhat-developer/yaml-language-server/pull/197)

#### 0.5.3

- Remove document range formatter registration [#PR](https://github.com/redhat-developer/yaml-language-server/pull/179)
- Catch errors that happen when schema store schemas cannot be grabbed [#PR](https://github.com/redhat-developer/yaml-language-server/pull/183)
- Fix for selection operators [#227](https://github.com/redhat-developer/vscode-yaml/issues/227)

#### 0.5.2

- Fix issue with format on copy [#220](https://github.com/redhat-developer/vscode-yaml/issues/220)
- Fix issue with custom schema provider where hover and validation weren't working [#216](https://github.com/redhat-developer/vscode-yaml/issues/216)
- Support URL schemes other than file or untitled [#PR](https://github.com/redhat-developer/vscode-yaml/pull/224)

#### 0.5.1

- Fix initialization problem that occurs when you write yaml without opening a folder/workspace/project

#### 0.5.0

- Fixed offset of undefined when hovering [#162](https://github.com/redhat-developer/yaml-language-server/issues/162)
- Fixed relative path schema loading [#154](https://github.com/redhat-developer/yaml-language-server/issues/154)
- Realigned features of YAML Language Server with JSON Language Server [#142](https://github.com/redhat-developer/yaml-language-server/issues/142)
- Adds in custom kubernetes schema comparator
- Fix for autocompletion not working when there are multiple enums available
- Fix for showing the correct validation when a key has an associated null value for kubernetes
- Fix for Array item properties being created with the wrong indent

#### 0.4.1

- Updated the kubernetes schema to be an upstream one [#PR](https://github.com/redhat-developer/yaml-language-server/pull/108)
- .clang-format and \_clang-format are now associated with YAML [#183](https://github.com/redhat-developer/vscode-yaml/issues/183)

#### 0.4.0

- Allow custom tags to have multiple types [#77](https://github.com/redhat-developer/yaml-language-server/issues/77)
- Made the formatter respect the yaml.format.enable setting [#PR](https://github.com/redhat-developer/yaml-language-server/pull/126)
- Updated the tmLanguage [#Commit](https://github.com/redhat-developer/vscode-yaml/commit/88b3715cc735a35ae83e5dfece42af8717cfc709)
- Fixed the yaml.trace.server description
- Added yaml.format.printWidth setting

#### 0.3.0

- Fixed custom tags crashing the language server [#112](https://github.com/redhat-developer/yaml-language-server/commit/4bcd36d629ef2c64641dc6edc948dbd02f35c437)
- Added setting yaml.schemaStore.enable to enable/disable the schema store [#115](https://github.com/redhat-developer/yaml-language-server/commit/4aa28a7dacadcc68126bd26e3b5311e046348799)
- Use the language server tab size when formatting [#116](https://github.com/redhat-developer/yaml-language-server/commit/1458e25926c7189cefc383141f4fad1d14a568b8)
- Only set CompletionItem.textEdit if it encompasses a single line [#139](https://github.com/redhat-developer/vscode-yaml/issues/139)

#### 0.2.1

- Added fix for language server crashing when settings.yaml.format was not sent [#111](https://github.com/redhat-developer/yaml-language-server/issues/111)

#### 0.2.0

- Added fix for bracket spacing option in formatter [#Commit](https://github.com/redhat-developer/yaml-language-server/commit/3b79ef397dbd215744c4577da9227298b3447bad)
- Added fix for boolean type [#Commit](https://github.com/redhat-developer/yaml-language-server/commit/9351ef54348e0a967a672e7c0f45b091ed53c533)
- Renamed extension to YAML [#Commit](https://github.com/redhat-developer/vscode-yaml/commit/cb59f85b3191fa30290dada1366d4b0c7e916f2b)

#### 0.1.0

- Fixed region markers not showing [#Commit](https://github.com/redhat-developer/vscode-yaml/commit/66852c9541048010829c88672170d13fc69221a6)

#### 0.0.17

- New icon [#Commit](https://github.com/redhat-developer/vscode-yaml/commit/2f49d24abe7be0df1a4999b48345b7643892b5c9)
- Ability to toggle hover/autocompletion [#Commit](https://github.com/redhat-developer/vscode-yaml/commit/abc35b1734c126f122a7635ba6b5ad5b55a0af5c)
- Add formatter settings [#Commit](https://github.com/redhat-developer/vscode-yaml/commit/ee6b82500b2e1bec9697dad3f0047fb619e482e1)
- Added a new formatter that uses prettier [#Commit](https://github.com/redhat-developer/yaml-language-server/commit/a5092e3d33a2e208bfea7941076518dedd2aba7b)

#### 0.0.16

- Support intellisense default value [#86](https://github.com/redhat-developer/yaml-language-server/pull/86)
- Fix intellisense doesn't work for array item [#85](https://github.com/redhat-developer/yaml-language-server/pull/85)

#### 0.0.15

- Fix handling scenario of multiple documents in single yaml file [#81](https://github.com/redhat-developer/yaml-language-server/commit/38da50092285aa499930d0e95fbbd7960b37b670)
- Support associate schemas with files in a regular expression [#Commit](https://github.com/redhat-developer/yaml-language-server/commit/d4a05e3dd72f55c53f1b0325c521a58f688839c9)

#### 0.0.14

- Fixed strange behaviour of formatter [#90](https://github.com/redhat-developer/vscode-yaml/issues/90)
- Fixed dynamic registration of formatter [#74](https://github.com/redhat-developer/yaml-language-server/issues/74)
- Relative paths fix [#92](https://github.com/redhat-developer/vscode-yaml/issues/92)

#### 0.0.13

- Show errors if schema cannot be grabbed [#73](https://github.com/redhat-developer/yaml-language-server/issues/73)
- The validator should support null values [#72](https://github.com/redhat-developer/yaml-language-server/issues/72)
- Server returning nothing on things such as completion errors Eclipse Che [#66](https://github.com/redhat-developer/yaml-language-server/issues/66)
- Return promises that resolve to null [#PR-71](https://github.com/redhat-developer/yaml-language-server/pull/71)
- Remove unused dependency to deep-equal [#PR-70](https://github.com/redhat-developer/yaml-language-server/pull/70)
- Added custom tags to autocompletion [#Commit](https://github.com/redhat-developer/yaml-language-server/commit/73c244a3efe09ec4250def78068c54af3acaed58)
- Remove yarn.lock from language contributes [#Commit](https://github.com/redhat-developer/vscode-yaml/commit/c65a3f870206306f5714cc7e5f0a181c40770201)

#### 0.0.12

- Support for custom tags [#59](https://github.com/redhat-developer/yaml-language-server/issues/59)
- Incorrect duplicate key registered when using YAML anchors [#82](https://github.com/redhat-developer/vscode-yaml/issues/82)
- Automatically insert colon on autocomplete [#78](https://github.com/redhat-developer/vscode-yaml/issues/78)

#### 0.0.11

- Fix for completion helper if it contains \r [#37](https://github.com/redhat-developer/yaml-language-server/issues/37)

#### 0.0.10

- Programmatically associate YAML files with schemas by other extensions [#61](https://github.com/redhat-developer/vscode-yaml/issues/61)
- Autocompletion not triggered while typing [#46](https://github.com/redhat-developer/vscode-yaml/issues/46)

#### 0.0.9

- Remove console.log from jsonSchemaService [#49](https://github.com/redhat-developer/yaml-language-server/issues/49)
- Change "Property {\$property_name} is not allowed" error message [#42](https://github.com/redhat-developer/yaml-language-server/issues/42)
- New Kubernetes Schema + Updated support for Kubernetes [#40](https://github.com/redhat-developer/yaml-language-server/issues/40)

#### 0.0.8

- Added Kedge back in as one of the default schemas
- Added file watch for json schema files in the workspace [#34](https://github.com/redhat-developer/yaml-language-server/issues/34)
- Multi root settings [#50](https://github.com/redhat-developer/vscode-yaml/issues/50)
- Fix for crashing yaml language server when !include is present [#52](https://github.com/redhat-developer/vscode-yaml/issues/52)
- Update tests to work on windows [#30](https://github.com/redhat-developer/yaml-language-server/issues/30)

#### 0.0.7

- Added validation toggle in settings [#20](https://github.com/redhat-developer/yaml-language-server/issues/20)
- YAML Schemas are pulled from JSON Schema Store [#15](https://github.com/redhat-developer/yaml-language-server/issues/15)
- YAML Diagnostics throw on a single line instead of the entire file [#19](https://github.com/redhat-developer/yaml-language-server/issues/19)
- Fix for getNodeFromOffset [#18](https://github.com/redhat-developer/yaml-language-server/issues/18)

#### 0.0.6

- Hotfix for making multiple schemas in the settings work again

#### 0.0.5

- Fixed Schema validation reports errors in valid YAML document [#42](https://github.com/redhat-developer/vscode-yaml/issues/42)
- Fixed Support for multiple YAML documents in single file [#43](https://github.com/redhat-developer/vscode-yaml/issues/43)

#### 0.0.4

- Fixed support for kubernetes files
- Fixed boolean notation for validation [#40](https://github.com/redhat-developer/vscode-yaml/issues/40)
- Fixed autocompletion for first new list item [#39](https://github.com/redhat-developer/vscode-yaml/issues/39)

#### 0.0.3

- Added new autocompletion service which is better for json schemas
- Added yamlValidation contribution point [#37](https://github.com/redhat-developer/vscode-yaml/issues/37)

#### 0.0.1

- Initial release with support for hover, document outlining, validation and auto completion

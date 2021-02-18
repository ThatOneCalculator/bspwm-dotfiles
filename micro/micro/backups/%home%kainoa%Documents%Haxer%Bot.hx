package;



class Main extends CommandBot{
	static function main() {
        new Main("<NzgwOTU1NDk2MjA2NDM0MzMz.X72new.gJzOm0dhBFBHfjZTMHSQI57PwwM>",Main,"-"); //Create an instance of Commandbot with the prefix `-`
    }

    @Command
    function ping(message:Message){
        message.react("✅"); //React to the message with "✅"
        message.reply({content:"Pong!"}); //Send "Pong!" in the same channel
    }
}

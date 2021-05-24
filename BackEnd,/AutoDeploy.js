require('dotenv').config()



commandsol = [
    `git add --all`,
    `git commit -m "Auto Update."`,
    `git push --set-upstream origin Nguyen_Heroku`,
    `git log`,
    `heroku log --tail`
]

commands = [
    ['clear', []],
    //[`git`, [`branch`, `checkout`, `master`] ],
    [`git`, [`add`, `--all`] ],
    [`git`, [`commit`, `-m "Auto Update."`] ],
    [`git`, [`push`, `origin`, `master`]]
//    [`git`, [`log`]],
//    [`heroku`, [`logs`, `--tail`] ]
]


function ExecuteCommandsOld(array){
    if(array.length<=0){
        console.log("All commands executed!")
        return;
    }
    else{
        const { exec } = require("child_process");
        
        const command = array.shift()
        console.log(`\nExecuting ${command}`)
        exec( command , (error, stdout, stderr) => {
            if (stderr || error) {
                console.log(`stderr: ${stderr} \n err: ${error}`);
                return;
            }
            else{
                console.log("stdout: \n", stdout); 
                ExecuteCommands(array)
            }
        });
    }
}


function ExecuteCommands(array){
    if(array.length<=0){
        return;
    }
    else{
        const {spawn } = require("child_process");
        const [command, args] = array.shift()
        console.log(`\nExecuting ${command}`)
        
        const com_inst = spawn(command, args);

        com_inst.stdout.on("data", data => {
            console.log(`stdout: ${data}`);
        });
        
        com_inst.stderr.on("data", data => {
            console.log(`stderr: ${data}`);
        });
        
        com_inst.on('error', (error) => {
            console.log(`error: ${error.message}`);
        });
        
        com_inst.on("close", code => {
            console.log(`child process exited with code ${code}`);
            if(code===0){
                ExecuteCommands(array)
            }
        });

    }
}

ExecuteCommands( commands );

//ExecuteCommands([ ['heroku', ['logs', '--tail']] ]);
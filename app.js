const fs = require('fs/promises');

//open (32) file descriptor , 
//read or write 
(async()=>{
    const createFile = async (path) => { 
        try{     
            let existingFileHandle = await fs.open(path, 'r');
            existingFileHandle.close()
            return console.log(`the path ${path} already exists`)
        }catch(err){
            const  newFileHandle = await fs.open(path,'w');
            console.log(`the path is created ${path}`);
            newFileHandle.close();
        }
    }
    const renameFile =async (oldPath,newPath) => {
        try{
            fs.rename(oldPath,newPath)
            console.log(`renaming ${oldPath} to ${newPath}`);
        }catch(err){
            if(err.code === 'ENOENT'){
                console.log(`no such file or directory for rename`)
            }else{
                console.log(`failed to rename ${oldPath} to ${newPath}`)
            }
        }
    }
    const deleteFile =async (path) => {
        try{
            await fs.unlink(path)
            console.log(`deleting ${path}`);
        }catch(err){
            if(err.code === 'ENOENT'){
                console.log(`no such file or directory`)
            }else{
                console.log(`failed to delete ${path}`)
            }
        }
    }
    const addToFile =async (path,content) => {
        try{
            debugger
            // let fileHandler = await fs.open(path , 'a')
            let fileHandler = await fs.open(path , 'w')
            fileHandler.write(content)
            console.log(`adding ${path} to ${content}`);
        }catch(err){
            debugger
            if(err.code === 'ENOENT'){
                console.log(`no such file or directory`)
            }else{
                console.log(`failed to add ${content} to ${path}`)
            }
        }
    }

    const commandFilehandler = await fs.open("./callback.txt","r")
    let CREATE_FILE =  "create the file"
    let DELETE_FILE = "delete the file"
    let RENAME_FILE = "rename the file"
    let ADD_TO_FILE = "add the file"
    commandFilehandler.on("change",async()=>{
        let size = (await commandFilehandler.stat()).size
        // allocate our buffer with the size of the file 
        let buffer = Buffer.alloc(size)
        // the location at which we want to start filing our buffer 
        let offset = 0
        // how many bytes we want to read 
        const length = buffer.byteLength
        // the position from where we want to start reading the file from
        const position = 0;
        // we always want to read the whole content (from beginning all the way to the end )
        let fileData = await commandFilehandler.read(buffer, offset, length,position)
        // decoder 01 => meaningful 
        // encoder meaningful => 01
        // console.log(fileData.buffer.toString('utf-8'))
        let command = buffer.toString('utf-8')

        if(command.includes(CREATE_FILE)){
            const filePath = command.substring(CREATE_FILE.length + 1)
            createFile(filePath)
        }
        if(command.includes(DELETE_FILE)){
            const filePath = command.substring(DELETE_FILE.length + 1)
            deleteFile(filePath)
        }
        // rename file
        // rename the file <path> to <new path>
        if(command.includes(RENAME_FILE)){
            const oldPath = command.substring(RENAME_FILE.length + 1, command.indexOf(' to '))
            const newPath = command.substring(command.indexOf(' to ') + 4)
            renameFile(oldPath,newPath)
        }
        // addd file 
        // add the file <path> this content
        if(command.includes(ADD_TO_FILE)){
            const filePath = command.substring(ADD_TO_FILE.length + 1, command.indexOf(' this content '))
            const content = command.substring(command.indexOf(' this content ') + 14)
            addToFile(filePath,content)
        }

    })
    const watcher = fs.watch('./callback.txt')
    for await (const event of watcher){
        if(event.eventType === 'change'){
           commandFilehandler.emit("change")
        }
    }
})()
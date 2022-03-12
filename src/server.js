const express = require('express')
const app = express()
const path = require('path')
const jwt = require('jsonwebtoken')
const { read, write } = require('./lib/FS')

const PORT = 7000
app.use(express.json())


const authUser = (req, res, next) => {
    const { name, password } = req.body
    const findUser = read(path.resolve('./src/model/user.json')).find( e => e.name == name && e.password == password )

    if(!findUser) {
        return res.sendStatus(401).send(`This user doesn't exist!`)
    }

    req.body.roleUser = findUser.id
    next()
   
}

///login user
app.post('/login', authUser,  (req, res) => {
    const {roleUser} = req.body
    res.send(jwt.sign({ id: roleUser }, 'SECRET_KEY'))
})


///autorization token
const authLogin = (req, res, next) => {
    const { access_token } = req.headers
    const { id } = jwt.verify(access_token, 'SECRET_KEY')

    const findUser = read(path.resolve('./src/model/user.json')).find( e => e.id == id)

    if(!findUser) {
        res.sendStatus(500).send(`Token is not correct`)
    }

    next()
}


/// get furniture data
app.get('/furniture', authLogin, (_, res) => {
    try {
        const getFurniture = read(path.resolve('./src/model/furniture.json'))
        res.send(getFurniture)
    }catch(err) {
        res.send(500).send(err.message)
    }
    
})

/// post furniture
app.post('/furniture', authLogin, (req, res) => {
    try{
        const { name, desc } = req.body
        const furnitureData = read(path.resolve('./src/model/furniture.json'))
        console.log(furnitureData);
        furnitureData.push({ id: furnitureData[furnitureData.length - 1].id + 1, name, desc})
        write(path.resolve('./src/model/furniture.json'), furnitureData)
        res.send('New furniture is added!')

    }catch (err) {
        res.sendStatus(400).send(err.message)
    }
})

///put furniture
app.put('/furniture/:id', authLogin, (req, res) => {
    try {
        const {id} = req.params
        const furnitureData = read(path.resolve('./src/model/furniture.json'))
        const foundFurniture = furnitureData.find(e => e.id == id)

        if(!foundFurniture){
            return res.send("This furniture doesn't exist, you can't edit")
        }
        const { name, desc} = req.body
        const foundIndex = furnitureData.findIndex(e => e.id == id)
        const newFurniture = {
            id,
            name,
            desc
        }
        furnitureData.splice(foundIndex, 1, newFurniture)
        write(path.resolve('./src/model/furniture.json'), furnitureData)
        res.send(" Furniture is updated")
        
    } catch(err) {
        res.status(500).send(err.message)
    }
})

///delete furniture 
app.delete('/furniture/:id', (req, res) => {
    try {
        const { id } = req.params
        const furnitureData = read(path.resolve('./src/model/furniture.json'))
        const foundFurniture = furnitureData.find(e => e.id == id)
        if(!foundFurniture){
            return res.send("This furniture doesn't exist, you can't delete")
        }

        const foundIndex = furnitureData.findIndex(e => e.id == id)

        furnitureData.splice(foundIndex, 1)
        write(path.resolve('./src/model/furniture.json'), furnitureData)
        res.send(" Furniture is deleted")
    } catch (err) {
        res.status(500).send(err.message)
    }

})

app.listen(PORT, () => {    
    console.log(`You are in ${PORT} port`);
})
const express = require('express')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const cors = require('cors')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'sample.db',
  define: {
    timestamps: false
  }
})
const VirtualShelf = sequelize.define('virtualshelf', {
  id:{
    type: Sequelize.STRING,
    primaryKey: true
  },
  description:{
    type: Sequelize.STRING,
    len:[3,1000],

  },
  creationDate:{
    type: Sequelize.DATE

  }
})

const Book = sequelize.define('book', {

  id:{
    type: Sequelize.STRING,
    primaryKey: true
  },

  title: {
    type: Sequelize.STRING,
    len:[3,100],

  },
  genre:{
    type: Sequelize.ENUM,
        values: ['COMEDY', 'TRAGEDY', 'ACTION']
  },
   url:{
     type: Sequelize.STRING,
     validate: {
      isUrl: true, 
    }

   }
})



VirtualShelf.hasMany(Book)

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.get('/sync', async (req, res) => {
  try {
    await sequelize.sync({ force: true })
    res.status(201).json({ message: 'created' })
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

//http://localhost:8080/virtuals?page=0
//http://localhost:8080/virtuals?description=second
//http://localhost:8080/virtuals?id=2
//http://localhost:8080/virtuals?sortField=description&sortOrder=1
////http://localhost:8080/virtuals?sortField=description&sortOrder=-1
//http://localhost:8080/virtuals?page=1&pageSize=1


app.get('/virtuals', async (req, res) => {
  try {
    const query = {}
    let pageSize = 2
    const allowedFilters = ['id', 'description']
    const filterKeys = Object.keys(req.query).filter(e => allowedFilters.indexOf(e) !== -1)
    if (filterKeys.length > 0) {
      query.where = {}
      for (const key of filterKeys) {
        query.where[key] = {
          [Op.like]: `%${req.query[key]}%`
        }
      }
    }

    const sortField = req.query.sortField
    let sortOrder = 'ASC'
    if (req.query.sortOrder && req.query.sortOrder === '-1') {
      sortOrder = 'DESC'
    }

    if (req.query.pageSize) {
      pageSize = parseInt(req.query.pageSize)
    }

    if (sortField) {
      query.order = [[sortField, sortOrder]]
    }

    if (!isNaN(parseInt(req.query.page))) {
      query.limit = pageSize
      query.offset = pageSize * parseInt(req.query.page)
    }

    const records = await VirtualShelf.findAll(query)
    const count = await VirtualShelf.count()
    res.status(200).json({ records, count })
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.post('/virtuals', async (req, res) => {
  try {
    if (req.query.bulk && req.query.bulk === 'on') {
      await VirtualShelf.bulkCreate(req.body)
      res.status(201).json({ message: 'created' })
    } else {
      await VirtualShelf.create(req.body)
      res.status(201).json({ message: 'created' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.put('/virtuals/:id', async (req, res) => {
  try {
    const vs = await VirtualShelf.findByPk(req.params.id)
    if (vs) {
      await vs.update(req.body, { fields: ['id', 'description', 'creationDate'] })
      res.status(202).json({ message: 'accepted' })
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})
app.delete('/virtuals/:id', async (req, res) => {
  try {
    const vs = await VirtualShelf.findByPk(req.params.id)
    if (vs) {
      await vs.destroy(req.body)
      res.status(202).json({ message: 'accepted' })
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})





app.get('/virtuals/:vid/books', async (req, res) => {
  try {
    const vs = await VirtualShelf.findByPk(req.params.vid)
    if (vs) {
      const books = await vs.getBooks()

      res.status(200).json(books)
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})
app.get('/virtuals/:vid/books/:bid', async (req, res) => {
  try {
    const vs = await VirtualShelf.findByPk(req.params.vid)
    if (vs) {
      const books = await vs.getBooks({ where: { id: req.params.bid } })
      const book = books.shift()
      if(book){
        res.status(200).json(book);
      }
      else{
        res.status(404).json({ message: 'not found' })

      }
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.post('/virtuals/:vid/books', async (req, res) => {
  try {
    const vs = await VirtualShelf.findByPk(req.params.vid)
    if (vs) {
      const book = req.body
      book.vsId = vs.id
      console.warn(book)
      await Book.create(book)
      res.status(201).json({ message: 'created' })
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.put('/vs/:vid/books/:bid', async (req, res) => {
  try {
    const vs = await VirtualShelf.findByPk(req.params.vid)
    if (vs) {
      const books = await vs.getBooks({ where: { id: req.params.bid } })
      const book = books.shift()
      if (book) {
        await book.update(req.body)
        res.status(202).json({ message: 'accepted' })
      } else {
        res.status(404).json({ message: 'not found' })
      }
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.delete('/virtuals/:vid/books/:bid', async (req, res) => {
  try {
    const vs = await VirtualShelf.findByPk(req.params.vid)
    if (vs) {
      const books = await vs.getBooks({ where: { id: req.params.bid } })
      const book = books.shift()
      if (book) {
        await book.destroy(req.body)
        res.status(202).json({ message: 'accepted' })
      } else {
        res.status(404).json({ message: 'not found' })
      }
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})




//import
app.post('/', async (request, response, next) => {
  try {
    for (let v of request.body) {
      const vs = await VirtualShelf.create(v);
      for (let b of v.books) {
        const book = await Book.create(b);
        vs.addBook(book);
      }
      await vs.save();
    }
    response.sendStatus(204);
  } catch (error) {
    next(error);
  }
});


//export
app.get('/', async (request, response, next) => {
  try {
    const result = [];
      for( let v of await VirtualShelf.findAll()){
        const virtualshelf={
          id: v.id,
          description:v.description,
          creationDate: v.creationDate,
           books:[]
        };

        for( let b of await v.getBooks()){
          virtualshelf.books.push({
            id:b.id,
            title:b.title,
            genre:b.genre,
            url:b.url
          });
        }

        result.push(virtualshelf);
      }
    if (result.length > 0) {
      response.json(result);
    } else {
      response.sendStatus(204);
    }
  } catch (error) {
    next(error);
  }
});

app.listen(8080)

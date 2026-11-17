import express, { type Application, type Request, type Response } from "express"
const app: Application = express()
const port = 3000
import {Pool} from "pg"
import config from "./config";

app.use(express.json())
app.use(express.text())

const pool = new Pool({
    connectionString: config.connecting_String
})
// console.log(pool)

const initDb = async() => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            age INT,
            is_Active BOOLEAN DEFAULT true,

            created_At TIMESTAMP DEFAULT NOW(),
            updated_At TIMESTAMP DEFAULT NOW()
            );
        `)
    } catch (error) {
        console.log(error)
    }
}

initDb()

app.get('/', (req: Request, res: Response) => {
//   res.send('Umayer Ahmad')
    res.status(200).json({
        success: true,
        message: "This is root route",
        author: "PH"
    })
})

app.post('/api', async (req: Request, res: Response) => {
    // console.log(req.body)

    try {
        const {name, email, password, age} = req.body

    const result = await pool.query(`
        INSERT INTO users (name,email,password,age)
        VALUES ($1,$2,$3,$4) RETURNING *
        `,
        [name, email, password, age]
    )

    // console.log(result)

    res.status(201).json({
        success: true,
        message: "User Created",
        data: result.rows[0],
    })
    } catch (error: any) {
        res.status(500).json({
        success: false,
        message: error?.message,
        data: error,
    })
    }
})

app.get('/api', async (req: Request, res: Response) => {
    try {

        const result = await pool.query(`
            SELECT * FROM users
            `)
        
            // console.log(result)
        res.status(201).json({
            success: true,
            message: "User REtrived Successfully",
            data: result.rows,
        })

    } catch (error: any) {
        res.status(500).json({
        success: false,
        message: error?.message,
        data: error,
    })
    }
})

app.get('/api/:id', async (req: Request, res: Response) => {
    try {
        const {id} = req.params
        const result = await pool.query(`
            SELECT * FROM users WHERE id=$1
            `,
        [id])

        if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "User not found!!",
      });
    }
        
            // console.log(result)
        res.status(201).json({
            success: true,
            message: "User REtrived Successfully",
            data: result.rows[0],
        })

    } catch (error: any) {
        res.status(500).json({
        success: false,
        message: error?.message,
        data: error,
    })
    }
})

app.put('/api/:id', async (req: Request, res: Response) => {
    try {

        const {id} = req.params
        const {name,password,age,is_Active} = req.body

        const result = await pool.query(`
            UPDATE users
            SET
            name = COALESCE($1, name),
            password = COALESCE($2, password),
            age = COALESCE($3, age),
            is_Active = COALESCE($4, is_Active),
            updated_At = NOW()
            WHERE id=$5 RETURNING *
            `,
        [name??null, password??null, age??null, is_Active??null, id]
    )

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "User not found!!",
      });
    }

        res.status(201).json({
            success: true,
            message: "User Updated Successfully",
            data: result.rows[0],
        })
        
    } catch (error: any) {
        res.status(500).json({
        success: false,
        message: error?.message,
        data: error,
    })
    }
})

app.delete('/api/:id', async (req: Request, res: Response) => {
    try {

        const {id} = req.params

        const result = await pool.query(`
            DELETE FROM users WHERE id=$1
            `,
        [id]
    )

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "User not found!!",
      });
    }

        res.status(201).json({
            success: true,
            message: "User Deleted Successfully",
            data: result.rows[0],
        })
        
    } catch (error: any) {
        res.status(500).json({
        success: false,
        message: error?.message,
        data: error,
    })
    }
})

app.listen(config.port, () => {
  console.log(`Server is running ${port}`)
})
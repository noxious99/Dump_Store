const http = require("http");
const url = require("url");
const {StringDecoder} = require("string_decoder");

const app = {};
const decoder = new StringDecoder('utf-8');

app.config = {
    port: 9000,
}

app.createServer = () =>
{
    const server = http.createServer();
    server.listen(app.config.port, () =>
    {
        console.log(`Server Running at ${app.config.port}`);
    })
}

// app.handleServer = (req, res) =>
// {
//     const parsedUrl = url.parse(req.url, true);
//     const path = parsedUrl.pathname;
//     const header = req.headers;
//     console.log(header);
    
//     res.end("thaam");
// }

app.createServer();

// app.post("/post", async (req, res) => {
//     const { name, age, experience } = req.body;
//     try {
//       const user = await User.create({ name, age, experience });
//       // res.status(200).json({ message: "inserted successfully!!" });
//       res.json({message: "inserted successfully!!", user});
//     } catch (err) {
//       res.status(500).json({ message: "server side error" }, err);
//     }
//   });
  
//   app.get("/post/:id", async (req, res) => {
//     try {
//       const user = await User.findById({ _id: req.params.id });
//       res.json(user);
//     } catch (err) {
//       res.status(500).json({ message: "server side error" }, err);
//     }
//   });
  
//   app.patch("/post/:id", async (req, res) => {
//     try {
//       const user = await User.findOneAndUpdate(
//         { _id: req.params.id },
//         {
//           $set: {
//             name: "cersie",
//           },
//         }
//       );
//       res.status(200).json(user);
//     } catch (err) {
//       res.status(500).json({ message: "server side error" }, err);
//     }
//   });
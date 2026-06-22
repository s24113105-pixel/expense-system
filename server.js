require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

const User = require("./models/User");
const Account = require("./models/Account");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
    session({
        secret: "mysecret123",
        resave: false,
        saveUninitialized: false
    })
);

// MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected");
})
.catch(err => {
    console.log(err);
});

// 驗證登入
function auth(req, res, next) {

    if (!req.session.userId) {

        return res.status(401).json({
            msg: "請先登入"
        });

    }

    next();

}

// 首頁自動跳登入頁
app.get("/", (req, res) => {
    res.redirect("/login.html");
});

// 測試
app.get("/test", (req, res) => {
    res.send("OK");
});

// ======================
// 註冊
// ======================

app.post("/api/register", async (req, res) => {

    try {

        const { username, password } = req.body;

        const exist = await User.findOne({
            username
        });

        if (exist) {

            return res.status(400).json({
                msg: "帳號已存在"
            });

        }

        const hash = await bcrypt.hash(password, 10);

        await User.create({
            username,
            password: hash
        });

        res.json({
            success: true
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            msg: err.message
        });

    }

});

// ======================
// 登入
// ======================

app.post("/api/login", async (req, res) => {

    try {

        const { username, password } = req.body;

        const user = await User.findOne({
            username
        });

        if (!user) {

            return res.status(400).json({
                msg: "帳號不存在"
            });

        }

        const ok = await bcrypt.compare(
            password,
            user.password
        );

        if (!ok) {

            return res.status(400).json({
                msg: "密碼錯誤"
            });

        }

        req.session.userId = user._id;

        res.json({
            success: true
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            msg: err.message
        });

    }

});

// ======================
// 登出
// ======================

app.get("/api/logout", (req, res) => {

    req.session.destroy(() => {

        res.json({
            success: true
        });

    });

});

// ======================
// 新增記帳
// ======================

app.post("/api/accounts", auth, async (req, res) => {

    try {

        const account = await Account.create({

            userId: req.session.userId,

            type: req.body.type,

            amount: req.body.amount,

            category: req.body.category,

            note: req.body.note

        });

        res.json(account);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            msg: err.message
        });

    }

});

// ======================
// 查詢自己的記帳
// ======================

app.get("/api/accounts", auth, async (req, res) => {

    try {

        const data = await Account.find({
            userId: req.session.userId
        });

        res.json(data);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            msg: err.message
        });

    }

});

// ======================
// 刪除自己的記帳
// ======================

app.delete("/api/accounts/:id", auth, async (req, res) => {

    try {

        await Account.deleteOne({

            _id: req.params.id,

            userId: req.session.userId

        });

        res.json({
            success: true
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            msg: err.message
        });

    }

});

app.listen(3000, () => {

    console.log("Server Running");

});
const keepServerWarm = (req, res) => {
    const token = req.get("x-keepwarm-token")
    if (!token || token !== process.env.SERVER_WARM_TOKEN) {
        console.log("token: ", token)
        return res.status(401).json({ ok: false, error: "Unauthorized" });
    }
    res.set("Cache-Control", "no-store");
    return res.status(200).json({
        ok: true,
        message: "Server alive",
        serverTime: new Date().toISOString(),
    })
}

module.exports = {keepServerWarm}
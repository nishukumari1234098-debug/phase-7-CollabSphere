import jwt from "jsonwebtoken"

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({ message: "Authentication required" })
    }


    try {
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("Decoded token:", decoded);

        req.userId = decoded.userId || decoded.id || decoded._id;

        if (!req.userId) {
            return res.status(401).json({ message: "User ID missing from token" });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

}

export default authMiddleware
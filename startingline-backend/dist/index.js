"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_local_1 = __importDefault(require("./routes/auth-local"));
const events_local_1 = __importDefault(require("./routes/events-local"));
const debug_1 = __importDefault(require("./routes/debug"));
const tickets_1 = __importDefault(require("./routes/tickets"));
const articles_1 = __importDefault(require("./routes/articles"));
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
dotenv_1.default.config();
const database_1 = require("./lib/database");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.use('/api/auth', auth_local_1.default);
app.use('/api/events', events_local_1.default);
app.use('/api/debug', debug_1.default);
app.use('/api/tickets', tickets_1.default);
app.use('/api/articles', articles_1.default);
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, async () => {
    console.log(`
🚀 Starting Line API Server is running!
   
   Port: ${PORT}
   Environment: ${process.env.NODE_ENV || 'development'}
   Database: Local PostgreSQL
   
   📊 Health Check: http://localhost:${PORT}/health
   🔧 API Endpoints: http://localhost:${PORT}/api
   🔐 Auth: http://localhost:${PORT}/api/auth
   
   Ready to handle events! 🏁
  `);
    const dbConnected = await (0, database_1.testConnection)();
    if (dbConnected) {
        console.log('✅ Database connection verified');
    }
    else {
        console.log('❌ Database connection failed - check your PostgreSQL setup');
    }
});
exports.default = app;
//# sourceMappingURL=index.js.map
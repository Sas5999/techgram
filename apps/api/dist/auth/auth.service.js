"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../db/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    prisma;
    jwtSecret = process.env.JWT_SECRET || 'super-secret-techgram-jwt-token-key-2026';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async register(email, fullName, passwordHash) {
        const existing = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existing) {
            throw new common_1.HttpException('Email already registered', common_1.HttpStatus.BAD_REQUEST);
        }
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(passwordHash, salt);
        const user = await this.prisma.user.create({
            data: {
                email,
                fullName,
                passwordHash: hashedPassword,
                preferences: {
                    create: {
                        founderModeEnabled: false,
                    },
                },
            },
            include: {
                preferences: true,
            },
        });
        const token = this.generateJwt({ id: user.id, email: user.email, name: user.fullName });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                tier: user.tier,
            },
        };
    }
    async login(email, passwordHash) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user || !user.passwordHash) {
            throw new common_1.HttpException('Invalid email or password', common_1.HttpStatus.UNAUTHORIZED);
        }
        const isMatch = await bcrypt.compare(passwordHash, user.passwordHash);
        if (!isMatch) {
            throw new common_1.HttpException('Invalid email or password', common_1.HttpStatus.UNAUTHORIZED);
        }
        const token = this.generateJwt({ id: user.id, email: user.email, name: user.fullName });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                tier: user.tier,
            },
        };
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                preferences: true,
            },
        });
        if (!user) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            tier: user.tier,
            preferences: user.preferences,
        };
    }
    generateJwt(payload) {
        const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
        const encodedPayload = Buffer.from(JSON.stringify({
            ...payload,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
        })).toString('base64url');
        const signature = crypto
            .createHmac('sha256', this.jwtSecret)
            .update(`${header}.${encodedPayload}`)
            .digest('base64url');
        return `${header}.${encodedPayload}.${signature}`;
    }
    verifyJwt(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3)
                return null;
            const [header, payload, signature] = parts;
            const verifiedSignature = crypto
                .createHmac('sha256', this.jwtSecret)
                .update(`${header}.${payload}`)
                .digest('base64url');
            if (signature !== verifiedSignature)
                return null;
            const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
            if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
                return null;
            }
            return decodedPayload;
        }
        catch {
            return null;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
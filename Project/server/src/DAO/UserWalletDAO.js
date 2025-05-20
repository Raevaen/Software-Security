"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserWalletDAO = void 0;
var UserWallet_1 = require("../Models/UserWallet");
var db_1 = require("../Config/db");
/**
 * DAO per la gestione dell'accesso ai dati del WalletBalance
 * Questa classe fornisce metodi per salvare, recuperare e aggiornare i saldi del portafoglio nel database.
 * Utilizza il modulo db per eseguire query SQL.
 */
var UserWalletDAO = /** @class */ (function () {
    function UserWalletDAO() {
    }
    // Salvataggio di un WalletBalance
    UserWalletDAO.prototype.save = function (walletBalance) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.execute("INSERT INTO wallets (id_user, address, balance) VALUES (?, ?, ?)", [
                            walletBalance.userId,
                            walletBalance.address,
                            walletBalance.balance
                        ])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Recupero del WalletBalance per un utente
    UserWalletDAO.prototype.findByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var rows, row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.execute("SELECT * FROM wallets WHERE id_user = ?", [userId])];
                    case 1:
                        rows = (_a.sent())[0];
                        if (rows.length === 0)
                            return [2 /*return*/, undefined];
                        row = rows[0];
                        return [2 /*return*/, this.mapRowToWalletBalance(row)];
                }
            });
        });
    };
    // Aggiornamento del saldo del WalletBalance per un utente
    UserWalletDAO.prototype.update = function (walletBalance) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.execute("UPDATE wallets SET address = ?, balance = ? WHERE id_user = ?", [
                            walletBalance.address,
                            walletBalance.balance,
                            walletBalance.userId
                        ])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Funzione di utilità per convertire una riga del DB in un oggetto WalletBalance
    UserWalletDAO.prototype.mapRowToWalletBalance = function (row) {
        return new UserWallet_1.UserWallet(row.id_user, row.balance, row.address);
    };
    return UserWalletDAO;
}());
exports.UserWalletDAO = UserWalletDAO;

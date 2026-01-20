export var EServerBrowserGameFilterAntiCheat;
(function (EServerBrowserGameFilterAntiCheat) {
    EServerBrowserGameFilterAntiCheat[EServerBrowserGameFilterAntiCheat["All"] = 0] = "All";
    EServerBrowserGameFilterAntiCheat[EServerBrowserGameFilterAntiCheat["Secure"] = 1] = "Secure";
    EServerBrowserGameFilterAntiCheat[EServerBrowserGameFilterAntiCheat["NotSecure"] = 2] = "NotSecure";
})(EServerBrowserGameFilterAntiCheat || (EServerBrowserGameFilterAntiCheat = {}));
export var EServerBrowserGameFilterPing;
(function (EServerBrowserGameFilterPing) {
    EServerBrowserGameFilterPing[EServerBrowserGameFilterPing["All"] = 0] = "All";
    EServerBrowserGameFilterPing[EServerBrowserGameFilterPing["LessThan50"] = 50] = "LessThan50";
    EServerBrowserGameFilterPing[EServerBrowserGameFilterPing["LessThan100"] = 100] = "LessThan100";
    EServerBrowserGameFilterPing[EServerBrowserGameFilterPing["LessThan150"] = 150] = "LessThan150";
    EServerBrowserGameFilterPing[EServerBrowserGameFilterPing["LessThan250"] = 250] = "LessThan250";
})(EServerBrowserGameFilterPing || (EServerBrowserGameFilterPing = {}));
export var EJoinServerError;
(function (EJoinServerError) {
    EJoinServerError[EJoinServerError["PingFailed"] = -3] = "PingFailed";
    EJoinServerError[EJoinServerError["Connecting"] = -2] = "Connecting";
    EJoinServerError[EJoinServerError["Pinging"] = -1] = "Pinging";
    EJoinServerError[EJoinServerError["None"] = 0] = "None";
    EJoinServerError[EJoinServerError["VACBanned"] = 1] = "VACBanned";
    EJoinServerError[EJoinServerError["ServerFull"] = 2] = "ServerFull";
    EJoinServerError[EJoinServerError["ModNotInstalled"] = 3] = "ModNotInstalled";
    EJoinServerError[EJoinServerError["AppNotFound"] = 4] = "AppNotFound";
    EJoinServerError[EJoinServerError["NotInitialized"] = 5] = "NotInitialized";
})(EJoinServerError || (EJoinServerError = {}));

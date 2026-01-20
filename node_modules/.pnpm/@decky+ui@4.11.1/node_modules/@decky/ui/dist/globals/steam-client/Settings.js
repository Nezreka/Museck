export var ESteamGuardState;
(function (ESteamGuardState) {
    ESteamGuardState[ESteamGuardState["EmailUnverified"] = 0] = "EmailUnverified";
    ESteamGuardState[ESteamGuardState["Protected"] = 1] = "Protected";
    ESteamGuardState[ESteamGuardState["Disabled"] = 2] = "Disabled";
    ESteamGuardState[ESteamGuardState["Offline"] = 3] = "Offline";
    ESteamGuardState[ESteamGuardState["NotEnabled"] = 4] = "NotEnabled";
})(ESteamGuardState || (ESteamGuardState = {}));
export var ELanguage;
(function (ELanguage) {
    ELanguage[ELanguage["None"] = -1] = "None";
    ELanguage[ELanguage["English"] = 0] = "English";
    ELanguage[ELanguage["German"] = 1] = "German";
    ELanguage[ELanguage["French"] = 2] = "French";
    ELanguage[ELanguage["Italian"] = 3] = "Italian";
    ELanguage[ELanguage["Korean"] = 4] = "Korean";
    ELanguage[ELanguage["Spanish"] = 5] = "Spanish";
    ELanguage[ELanguage["SimplifiedChinese"] = 6] = "SimplifiedChinese";
    ELanguage[ELanguage["TraditionalChinese"] = 7] = "TraditionalChinese";
    ELanguage[ELanguage["Russian"] = 8] = "Russian";
    ELanguage[ELanguage["Thai"] = 9] = "Thai";
    ELanguage[ELanguage["Japanese"] = 10] = "Japanese";
    ELanguage[ELanguage["Portuguese"] = 11] = "Portuguese";
    ELanguage[ELanguage["Polish"] = 12] = "Polish";
    ELanguage[ELanguage["Danish"] = 13] = "Danish";
    ELanguage[ELanguage["Dutch"] = 14] = "Dutch";
    ELanguage[ELanguage["Finnish"] = 15] = "Finnish";
    ELanguage[ELanguage["Norwegian"] = 16] = "Norwegian";
    ELanguage[ELanguage["Swedish"] = 17] = "Swedish";
    ELanguage[ELanguage["Hungarian"] = 18] = "Hungarian";
    ELanguage[ELanguage["Czech"] = 19] = "Czech";
    ELanguage[ELanguage["Romanian"] = 20] = "Romanian";
    ELanguage[ELanguage["Turkish"] = 21] = "Turkish";
    ELanguage[ELanguage["Brazilian"] = 22] = "Brazilian";
    ELanguage[ELanguage["Bulgarian"] = 23] = "Bulgarian";
    ELanguage[ELanguage["Greek"] = 24] = "Greek";
    ELanguage[ELanguage["Arabic"] = 25] = "Arabic";
    ELanguage[ELanguage["Ukrainian"] = 26] = "Ukrainian";
    ELanguage[ELanguage["LatamSpanish"] = 27] = "LatamSpanish";
    ELanguage[ELanguage["Vietnamese"] = 28] = "Vietnamese";
    ELanguage[ELanguage["SteamChina_SChinese"] = 29] = "SteamChina_SChinese";
    ELanguage[ELanguage["Max"] = 30] = "Max";
})(ELanguage || (ELanguage = {}));
export var EClientBetaState;
(function (EClientBetaState) {
    EClientBetaState[EClientBetaState["None"] = 0] = "None";
    EClientBetaState[EClientBetaState["NoneChosen"] = 1] = "NoneChosen";
    EClientBetaState[EClientBetaState["NoneChosenNonAdmin"] = 2] = "NoneChosenNonAdmin";
    EClientBetaState[EClientBetaState["InBeta"] = 3] = "InBeta";
    EClientBetaState[EClientBetaState["InBetaNonAdmin"] = 4] = "InBetaNonAdmin";
})(EClientBetaState || (EClientBetaState = {}));
export var EBroadcastEncoderSetting;
(function (EBroadcastEncoderSetting) {
    EBroadcastEncoderSetting[EBroadcastEncoderSetting["BestQuality"] = 0] = "BestQuality";
    EBroadcastEncoderSetting[EBroadcastEncoderSetting["BestPerformance"] = 1] = "BestPerformance";
})(EBroadcastEncoderSetting || (EBroadcastEncoderSetting = {}));
export var EBroadcastPermission;
(function (EBroadcastPermission) {
    EBroadcastPermission[EBroadcastPermission["Disabled"] = 0] = "Disabled";
    EBroadcastPermission[EBroadcastPermission["FriendsApprove"] = 1] = "FriendsApprove";
    EBroadcastPermission[EBroadcastPermission["FriendsAllowed"] = 2] = "FriendsAllowed";
    EBroadcastPermission[EBroadcastPermission["Public"] = 3] = "Public";
    EBroadcastPermission[EBroadcastPermission["Subscribers"] = 4] = "Subscribers";
})(EBroadcastPermission || (EBroadcastPermission = {}));
export var EExportCodec;
(function (EExportCodec) {
    EExportCodec[EExportCodec["Default"] = 0] = "Default";
    EExportCodec[EExportCodec["H264"] = 1] = "H264";
    EExportCodec[EExportCodec["H265"] = 2] = "H265";
})(EExportCodec || (EExportCodec = {}));
export var EGRAudio;
(function (EGRAudio) {
    EGRAudio[EGRAudio["Game"] = 0] = "Game";
    EGRAudio[EGRAudio["System"] = 1] = "System";
    EGRAudio[EGRAudio["Select"] = 2] = "Select";
})(EGRAudio || (EGRAudio = {}));
export var EGRExportLimitType;
(function (EGRExportLimitType) {
    EGRExportLimitType[EGRExportLimitType["Native"] = 0] = "Native";
    EGRExportLimitType[EGRExportLimitType["FileSize"] = 1] = "FileSize";
    EGRExportLimitType[EGRExportLimitType["Advanced"] = 2] = "Advanced";
})(EGRExportLimitType || (EGRExportLimitType = {}));
export var EGRMode;
(function (EGRMode) {
    EGRMode[EGRMode["Never"] = 0] = "Never";
    EGRMode[EGRMode["Always"] = 1] = "Always";
    EGRMode[EGRMode["Manual"] = 2] = "Manual";
})(EGRMode || (EGRMode = {}));
export var EHDRVisualization;
(function (EHDRVisualization) {
    EHDRVisualization[EHDRVisualization["None"] = 0] = "None";
    EHDRVisualization[EHDRVisualization["Heatmap"] = 1] = "Heatmap";
    EHDRVisualization[EHDRVisualization["Analysis"] = 2] = "Analysis";
    EHDRVisualization[EHDRVisualization["HeatmapExtended"] = 3] = "HeatmapExtended";
    EHDRVisualization[EHDRVisualization["HeatmapClassic"] = 4] = "HeatmapClassic";
})(EHDRVisualization || (EHDRVisualization = {}));

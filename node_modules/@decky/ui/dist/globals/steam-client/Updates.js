export var EOSBranch;
(function (EOSBranch) {
    EOSBranch[EOSBranch["Unknown"] = 0] = "Unknown";
    EOSBranch[EOSBranch["Release"] = 1] = "Release";
    EOSBranch[EOSBranch["ReleaseCandidate"] = 2] = "ReleaseCandidate";
    EOSBranch[EOSBranch["Beta"] = 3] = "Beta";
    EOSBranch[EOSBranch["BetaCandidate"] = 4] = "BetaCandidate";
    EOSBranch[EOSBranch["Preview"] = 5] = "Preview";
    EOSBranch[EOSBranch["PreviewCandidate"] = 6] = "PreviewCandidate";
    EOSBranch[EOSBranch["Main"] = 7] = "Main";
    EOSBranch[EOSBranch["Staging"] = 8] = "Staging";
})(EOSBranch || (EOSBranch = {}));
export var EUpdaterState;
(function (EUpdaterState) {
    EUpdaterState[EUpdaterState["Invalid"] = 0] = "Invalid";
    EUpdaterState[EUpdaterState["UpToDate"] = 2] = "UpToDate";
    EUpdaterState[EUpdaterState["Checking"] = 3] = "Checking";
    EUpdaterState[EUpdaterState["Available"] = 4] = "Available";
    EUpdaterState[EUpdaterState["Applying"] = 5] = "Applying";
    EUpdaterState[EUpdaterState["ClientRestartPending"] = 6] = "ClientRestartPending";
    EUpdaterState[EUpdaterState["SystemRestartPending"] = 7] = "SystemRestartPending";
    EUpdaterState[EUpdaterState["RollBack"] = 8] = "RollBack";
})(EUpdaterState || (EUpdaterState = {}));
export var EUpdaterType;
(function (EUpdaterType) {
    EUpdaterType[EUpdaterType["Invalid"] = 0] = "Invalid";
    EUpdaterType[EUpdaterType["Client"] = 1] = "Client";
    EUpdaterType[EUpdaterType["OS"] = 2] = "OS";
    EUpdaterType[EUpdaterType["BIOS"] = 3] = "BIOS";
    EUpdaterType[EUpdaterType["Aggregated"] = 4] = "Aggregated";
    EUpdaterType[EUpdaterType["Test1"] = 5] = "Test1";
    EUpdaterType[EUpdaterType["Test2"] = 6] = "Test2";
    EUpdaterType[EUpdaterType["Dummy"] = 7] = "Dummy";
})(EUpdaterType || (EUpdaterType = {}));

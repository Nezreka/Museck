export var ELoginState;
(function (ELoginState) {
    ELoginState[ELoginState["None"] = 0] = "None";
    ELoginState[ELoginState["WelcomeDialog"] = 1] = "WelcomeDialog";
    ELoginState[ELoginState["WaitingForCreateUser"] = 2] = "WaitingForCreateUser";
    ELoginState[ELoginState["WaitingForCredentials"] = 3] = "WaitingForCredentials";
    ELoginState[ELoginState["WaitingForNetwork"] = 4] = "WaitingForNetwork";
    ELoginState[ELoginState["WaitingForServerResponse"] = 5] = "WaitingForServerResponse";
    ELoginState[ELoginState["WaitingForLibraryReady"] = 6] = "WaitingForLibraryReady";
    ELoginState[ELoginState["Success"] = 7] = "Success";
    ELoginState[ELoginState["Quit"] = 8] = "Quit";
})(ELoginState || (ELoginState = {}));
export var EShutdownStep;
(function (EShutdownStep) {
    EShutdownStep[EShutdownStep["None"] = 0] = "None";
    EShutdownStep[EShutdownStep["Start"] = 1] = "Start";
    EShutdownStep[EShutdownStep["WaitForGames"] = 2] = "WaitForGames";
    EShutdownStep[EShutdownStep["WaitForCloud"] = 3] = "WaitForCloud";
    EShutdownStep[EShutdownStep["FinishingDownload"] = 4] = "FinishingDownload";
    EShutdownStep[EShutdownStep["WaitForDownload"] = 5] = "WaitForDownload";
    EShutdownStep[EShutdownStep["WaitForServiceApps"] = 6] = "WaitForServiceApps";
    EShutdownStep[EShutdownStep["WaitForLogOff"] = 7] = "WaitForLogOff";
    EShutdownStep[EShutdownStep["Done"] = 8] = "Done";
})(EShutdownStep || (EShutdownStep = {}));
export var ESuspendResumeProgressState;
(function (ESuspendResumeProgressState) {
    ESuspendResumeProgressState[ESuspendResumeProgressState["Invalid"] = 0] = "Invalid";
    ESuspendResumeProgressState[ESuspendResumeProgressState["Complete"] = 1] = "Complete";
    ESuspendResumeProgressState[ESuspendResumeProgressState["CloudSync"] = 2] = "CloudSync";
    ESuspendResumeProgressState[ESuspendResumeProgressState["LoggingIn"] = 3] = "LoggingIn";
    ESuspendResumeProgressState[ESuspendResumeProgressState["WaitingForApp"] = 4] = "WaitingForApp";
    ESuspendResumeProgressState[ESuspendResumeProgressState["Working"] = 5] = "Working";
})(ESuspendResumeProgressState || (ESuspendResumeProgressState = {}));

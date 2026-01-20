export var EHMDActivityLevel;
(function (EHMDActivityLevel) {
    EHMDActivityLevel[EHMDActivityLevel["Unknown"] = -1] = "Unknown";
    EHMDActivityLevel[EHMDActivityLevel["Idle"] = 0] = "Idle";
    EHMDActivityLevel[EHMDActivityLevel["UserInteraction"] = 1] = "UserInteraction";
    EHMDActivityLevel[EHMDActivityLevel["UserInteraction_Timeout"] = 2] = "UserInteraction_Timeout";
    EHMDActivityLevel[EHMDActivityLevel["Standby"] = 3] = "Standby";
    EHMDActivityLevel[EHMDActivityLevel["Idle_Timeout"] = 4] = "Idle_Timeout";
})(EHMDActivityLevel || (EHMDActivityLevel = {}));
export var EKeyboardFlags;
(function (EKeyboardFlags) {
    EKeyboardFlags[EKeyboardFlags["Minimal"] = 1] = "Minimal";
    EKeyboardFlags[EKeyboardFlags["Modal"] = 2] = "Modal";
    EKeyboardFlags[EKeyboardFlags["ShowArrowKeys"] = 4] = "ShowArrowKeys";
    EKeyboardFlags[EKeyboardFlags["HideDoneKey"] = 8] = "HideDoneKey";
})(EKeyboardFlags || (EKeyboardFlags = {}));

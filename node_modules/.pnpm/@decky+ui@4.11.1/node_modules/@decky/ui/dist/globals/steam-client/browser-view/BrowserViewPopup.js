export var EBrowserViewContextMenuTypeFlag;
(function (EBrowserViewContextMenuTypeFlag) {
    EBrowserViewContextMenuTypeFlag[EBrowserViewContextMenuTypeFlag["None"] = 0] = "None";
    EBrowserViewContextMenuTypeFlag[EBrowserViewContextMenuTypeFlag["Page"] = 1] = "Page";
    EBrowserViewContextMenuTypeFlag[EBrowserViewContextMenuTypeFlag["Frame"] = 2] = "Frame";
    EBrowserViewContextMenuTypeFlag[EBrowserViewContextMenuTypeFlag["Link"] = 4] = "Link";
    EBrowserViewContextMenuTypeFlag[EBrowserViewContextMenuTypeFlag["Media"] = 8] = "Media";
    EBrowserViewContextMenuTypeFlag[EBrowserViewContextMenuTypeFlag["Selection"] = 16] = "Selection";
    EBrowserViewContextMenuTypeFlag[EBrowserViewContextMenuTypeFlag["Editable"] = 32] = "Editable";
})(EBrowserViewContextMenuTypeFlag || (EBrowserViewContextMenuTypeFlag = {}));
export var EBrowserViewContextMenuEditFlag;
(function (EBrowserViewContextMenuEditFlag) {
    EBrowserViewContextMenuEditFlag[EBrowserViewContextMenuEditFlag["None"] = 0] = "None";
    EBrowserViewContextMenuEditFlag[EBrowserViewContextMenuEditFlag["CanUndo"] = 1] = "CanUndo";
    EBrowserViewContextMenuEditFlag[EBrowserViewContextMenuEditFlag["CanRedo"] = 2] = "CanRedo";
    EBrowserViewContextMenuEditFlag[EBrowserViewContextMenuEditFlag["CanCut"] = 4] = "CanCut";
    EBrowserViewContextMenuEditFlag[EBrowserViewContextMenuEditFlag["CanCopy"] = 8] = "CanCopy";
    EBrowserViewContextMenuEditFlag[EBrowserViewContextMenuEditFlag["CanPaste"] = 16] = "CanPaste";
    EBrowserViewContextMenuEditFlag[EBrowserViewContextMenuEditFlag["CanDelete"] = 32] = "CanDelete";
    EBrowserViewContextMenuEditFlag[EBrowserViewContextMenuEditFlag["CanSelectAll"] = 64] = "CanSelectAll";
    EBrowserViewContextMenuEditFlag[EBrowserViewContextMenuEditFlag["CanTranslate"] = 128] = "CanTranslate";
})(EBrowserViewContextMenuEditFlag || (EBrowserViewContextMenuEditFlag = {}));
export var EBrowserViewContextMenuCommand;
(function (EBrowserViewContextMenuCommand) {
    EBrowserViewContextMenuCommand[EBrowserViewContextMenuCommand["Close"] = -1] = "Close";
    EBrowserViewContextMenuCommand[EBrowserViewContextMenuCommand["OpenDevTools"] = 26500] = "OpenDevTools";
    EBrowserViewContextMenuCommand[EBrowserViewContextMenuCommand["CloseDevTools"] = 26501] = "CloseDevTools";
    EBrowserViewContextMenuCommand[EBrowserViewContextMenuCommand["InspectElement"] = 26502] = "InspectElement";
    EBrowserViewContextMenuCommand[EBrowserViewContextMenuCommand["OpenLinkInNewTab"] = 26503] = "OpenLinkInNewTab";
})(EBrowserViewContextMenuCommand || (EBrowserViewContextMenuCommand = {}));
export var EWindowStackingOrder;
(function (EWindowStackingOrder) {
    EWindowStackingOrder[EWindowStackingOrder["Bottom"] = 0] = "Bottom";
    EWindowStackingOrder[EWindowStackingOrder["Top"] = 1] = "Top";
})(EWindowStackingOrder || (EWindowStackingOrder = {}));

export var EConnectivityTestResult;
(function (EConnectivityTestResult) {
    EConnectivityTestResult[EConnectivityTestResult["Unknown"] = 0] = "Unknown";
    EConnectivityTestResult[EConnectivityTestResult["Connected"] = 1] = "Connected";
    EConnectivityTestResult[EConnectivityTestResult["CaptivePortal"] = 2] = "CaptivePortal";
    EConnectivityTestResult[EConnectivityTestResult["TimedOut"] = 3] = "TimedOut";
    EConnectivityTestResult[EConnectivityTestResult["Failed"] = 4] = "Failed";
    EConnectivityTestResult[EConnectivityTestResult["WifiDisabled"] = 5] = "WifiDisabled";
    EConnectivityTestResult[EConnectivityTestResult["NoLAN"] = 6] = "NoLAN";
})(EConnectivityTestResult || (EConnectivityTestResult = {}));
export var ENetFakeLocalSystemState;
(function (ENetFakeLocalSystemState) {
    ENetFakeLocalSystemState[ENetFakeLocalSystemState["Normal"] = 0] = "Normal";
    ENetFakeLocalSystemState[ENetFakeLocalSystemState["NoLAN"] = 1] = "NoLAN";
    ENetFakeLocalSystemState[ENetFakeLocalSystemState["CaptivePortal_Redirected"] = 2] = "CaptivePortal_Redirected";
    ENetFakeLocalSystemState[ENetFakeLocalSystemState["CaptivePortal_InPlace"] = 3] = "CaptivePortal_InPlace";
    ENetFakeLocalSystemState[ENetFakeLocalSystemState["NoInternet"] = 4] = "NoInternet";
    ENetFakeLocalSystemState[ENetFakeLocalSystemState["NoSteam"] = 5] = "NoSteam";
})(ENetFakeLocalSystemState || (ENetFakeLocalSystemState = {}));
export var EWirelessSecurityFlags;
(function (EWirelessSecurityFlags) {
    EWirelessSecurityFlags[EWirelessSecurityFlags["None"] = 0] = "None";
    EWirelessSecurityFlags[EWirelessSecurityFlags["StaticWep"] = 1] = "StaticWep";
    EWirelessSecurityFlags[EWirelessSecurityFlags["DynamicWep"] = 2] = "DynamicWep";
    EWirelessSecurityFlags[EWirelessSecurityFlags["Wpa"] = 4] = "Wpa";
    EWirelessSecurityFlags[EWirelessSecurityFlags["WpaEnterprise"] = 8] = "WpaEnterprise";
    EWirelessSecurityFlags[EWirelessSecurityFlags["Wpa2"] = 16] = "Wpa2";
    EWirelessSecurityFlags[EWirelessSecurityFlags["Wpa2Enterprise"] = 32] = "Wpa2Enterprise";
    EWirelessSecurityFlags[EWirelessSecurityFlags["Unsupported"] = 32768] = "Unsupported";
})(EWirelessSecurityFlags || (EWirelessSecurityFlags = {}));
export var ENetworkDeviceState;
(function (ENetworkDeviceState) {
    ENetworkDeviceState[ENetworkDeviceState["NotPresent"] = 0] = "NotPresent";
    ENetworkDeviceState[ENetworkDeviceState["Failed"] = 1] = "Failed";
    ENetworkDeviceState[ENetworkDeviceState["Disconnected"] = 2] = "Disconnected";
    ENetworkDeviceState[ENetworkDeviceState["Disconnecting"] = 3] = "Disconnecting";
    ENetworkDeviceState[ENetworkDeviceState["Connecting"] = 4] = "Connecting";
    ENetworkDeviceState[ENetworkDeviceState["Connected"] = 5] = "Connected";
    ENetworkDeviceState[ENetworkDeviceState["Retrying"] = 6] = "Retrying";
})(ENetworkDeviceState || (ENetworkDeviceState = {}));
export var ENetworkDeviceType;
(function (ENetworkDeviceType) {
    ENetworkDeviceType[ENetworkDeviceType["Unknown"] = 0] = "Unknown";
    ENetworkDeviceType[ENetworkDeviceType["Wired"] = 1] = "Wired";
    ENetworkDeviceType[ENetworkDeviceType["Wireless"] = 2] = "Wireless";
    ENetworkDeviceType[ENetworkDeviceType["Virtual"] = 3] = "Virtual";
})(ENetworkDeviceType || (ENetworkDeviceType = {}));
export var EWirelessEndpointStrength;
(function (EWirelessEndpointStrength) {
    EWirelessEndpointStrength[EWirelessEndpointStrength["None"] = 0] = "None";
    EWirelessEndpointStrength[EWirelessEndpointStrength["Weak"] = 1] = "Weak";
    EWirelessEndpointStrength[EWirelessEndpointStrength["Ok"] = 2] = "Ok";
    EWirelessEndpointStrength[EWirelessEndpointStrength["Good"] = 3] = "Good";
    EWirelessEndpointStrength[EWirelessEndpointStrength["Excellent"] = 4] = "Excellent";
})(EWirelessEndpointStrength || (EWirelessEndpointStrength = {}));

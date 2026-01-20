import { JsPbMessage, OperationResponse } from "../shared";
export interface Report {
    GenerateSystemReport(): Promise<SystemReportReply>;
    SaveToDesktop(reportId: string): Promise<OperationResponse>;
    Submit(reportId: string): Promise<OperationResponse>;
}
export interface SystemReportReply extends OperationResponse {
    reply?: ArrayBuffer;
}
export interface CMsgGenerateSystemReportReply extends JsPbMessage {
    report_id(): string | undefined;
    set_report_id(param0: any): any;
}

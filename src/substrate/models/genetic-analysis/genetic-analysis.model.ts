import { GeneticAnalysisStatus } from './genetic-analysis.status';

export class GeneticAnalysisModel {
  constructor(geneticAnalyst: any) {
    this.genetic_analysis_tracking_id = geneticAnalyst.geneticAnalysisTrackingId;
    this.genetic_analyst_id = geneticAnalyst.geneticAnalystId;
    this.owner_id = geneticAnalyst.ownerId;
    this.report_link = geneticAnalyst.reportLink;
    this.comment = geneticAnalyst.comment;
    this.rejected_title = geneticAnalyst.rejectedTitle;
    this.rejected_description = geneticAnalyst.rejectedDescription;
    this.genetic_analysis_order_id = geneticAnalyst.geneticAnalysisOrderId;
    this.created_at = geneticAnalyst.createdAt;
    this.updated_at = geneticAnalyst.updatedAt;
    this.status = geneticAnalyst.status;
  }

  public genetic_analysis_tracking_id: string;
  public genetic_analyst_id: string;
  public owner_id: string;
  public report_link: string;
  public comment?: string;
  public rejected_title?: string;
  public rejected_description?: string;
  public genetic_analysis_order_id: string;
  public created_at: string;
  public updated_at: string;
  public status: GeneticAnalysisStatus;
}

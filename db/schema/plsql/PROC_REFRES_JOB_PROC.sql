-- PROCEDURE: REFRES_JOB_PROC (status: VALID)
CREATE OR REPLACE
Procedure Refres_Job_Proc Is
								 Cursor C_Job Is Select Job From Sys.Dba_Jobs
										  Where Job <> 1 ;
								Begin
									For I In C_Job Loop
										Begin
										  Dbms_Job.Run(I.Job);
										Exception
								     When Others Then
								       Null;
								    End ;
									End Loop ;		
								End ;
/

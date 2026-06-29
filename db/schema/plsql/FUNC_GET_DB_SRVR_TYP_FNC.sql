-- FUNCTION: GET_DB_SRVR_TYP_FNC (status: VALID)
CREATE OR REPLACE
FUNCTION GET_DB_SRVR_TYP_FNC Return number Is
  V_Cnt1 Number := 0;
  V_Cnt2 Number := 0;
 Begin
--##---------------------------------------------------------------------------------##--
  Begin
   Select 1
     Into  V_Cnt1
    From   Dba_Snapshots
     Where Table_Name = 'IAS_ITM_MST'
      And  Owner      =  User
      And  RowNum <= 1 ;
  Exception
    When No_Data_Found Then
      V_Cnt1 :=  0 ;
    When Others Then
      Null ;
  End ;
  Begin
   Select 1
     Into  V_Cnt2
    From   Dba_Snapshot_Logs
     Where MASTER = 'IAS_ITM_MST'
      And  LOG_OWNER	  =  User
      And  RowNum <= 1 ;
  Exception
    When No_Data_Found Then
      V_Cnt2 :=  0 ;
    When Others Then
      Null ;
  End ;
--##---------------------------------------------------------------------------------##--
  If  V_Cnt1 > 0 Then
       If V_Cnt2>0 Then
	    Return (2) ; --##Sub Sub Server
       Else
	 Return (1) ; --##Sub Server
       End If;
  Else
	Return (0) ; --##Main Server
  End If ;
--##---------------------------------------------------------------------------------##--
 End GET_DB_SRVR_TYP_FNC;
/

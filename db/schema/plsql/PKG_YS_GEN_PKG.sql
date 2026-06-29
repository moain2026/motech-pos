-- =============================================
-- PACKAGE SPEC: YS_GEN_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE  YS_GEN_PKG AS
  FUNCTION GET_PRD_NM (P_PRD_NO IN S_PRD_DTL.PRD_NO%TYPE ,P_LNG_NO IN NUMBER DEFAULT 1	 )  RETURN NUMBER ;
  FUNCTION Get_Cnt (SqlStr VARCHAR2)  RETURN NUMBER ;
  FUNCTION Get_Frst_Day RETURN DATE ;
  FUNCTION Get_Final_Day RETURN DATE ;

  FUNCTION Get_Sysdate	RETURN DATE ;
  FUNCTION Get_Curdate	RETURN DATE ;
  FUNCTION Get_Local_Cur RETURN VARCHAR2 ;
  Function Get_Cur_Rate (P_Acy	     In Varchar2	     ,
			 P_Rate_Type In Number Default	0    ,
			 P_Date      In Date   Default	Null,
			 P_USR_NO    In Number Default	NULL ) Return Number;
  FUNCTION Get_Update_Doc_Period (P_UserNo  In Number ,
				    P_Ad_Date In Date	)  RETURN NUMBER ;
  FUNCTION Get_Delete_Doc_Period (P_UserNo  In Number ,
				    P_Ad_Date In Date	)  RETURN NUMBER ;
  FUNCTION Get_Usr_Fld_Prv ( P_Usr_No In Number ,
			       P_Frm_No In Number ,
			       P_Tab_Nm In Varchar2,
			      P_Fld_Nm In Varchar2)  RETURN NUMBER;
  FUNCTION Get_Fld_Value (P_Tab_Nm In Varchar2 ,P_Fld_Nm In Varchar2,P_WHR In varchar2 Default Null)  RETURN VARCHAR2 ;
  FUNCTION Get_Flg_Nm (P_flg_code In varchar2,P_flg_value In Number ,P_Lng_no In Number Default 1)  RETURN VARCHAR2 ;
  FUNCTION Get_Prompt (P_Lng_no In number ,P_Lbl_no In Number) RETURN VARCHAR2;
  FUNCTION Get_Msg  (P_Lng_no In number ,P_Msg_no In Number) RETURN VARCHAR2;
  FUNCTION Get_Frm_Nm (P_Frm_No In Number,P_Lng_no In Number Default 1)  RETURN VARCHAR2 ;
  FUNCTION Get_Val (SqlStr VARCHAR2)  RETURN VARCHAR2;
  FUNCTION GET_TXT_SRCH_FNC (P_TXT VARCHAR2) RETURN VARCHAR2 RESULT_CACHE;
  FUNCTION Chk_Lock_Rcrd (P_Tab Varchar2,P_Whr	Varchar) Return Boolean;	
END YS_GEN_PKG ;
/

-- ---------------------------------------------
-- PACKAGE BODY: YS_GEN_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY YS_GEN_PKG AS
--##-----------------------------------------------------------------------------##--
 FUNCTION GET_PRD_NM (P_PRD_NO IN S_PRD_DTL.PRD_NO%TYPE ,P_LNG_NO IN NUMBER DEFAULT 1	)  RETURN NUMBER IS
  V_PRD_NM  S_PRD_DTL.PRD_L_NM%TYPE;
 BEGIN

   SELECT DECODE(P_LNG_NO,1,PRD_L_NM,PRD_F_NM) INTO V_PRD_NM
     FROM S_PRD_DTL
    WHERE PRD_NO = P_PRD_NO
      AND ROWNUM <=1;

      RETURN(V_PRD_NM );


    EXCEPTION WHEN OTHERS THEN
      RETURN(P_PRD_NO);
 END GET_PRD_NM;
--##-----------------------------------------------------------------------------##--
FUNCTION Get_Cnt (SqlStr VARCHAR2)  RETURN NUMBER IS
 Val NUMBER;
Begin

Execute Immediate SqlStr Into Val;
 RETURN Val;

 Exception
  When No_Data_Found Then
   RETURN 0;
  When Others Then
   Raise_ApplICation_Error(-20406,'Error  Get_Cnt ' || '' || SqlErrm);
End Get_Cnt;
--##-----------------------------------------------------------------------------##--
FUNCTION Get_Frst_Day RETURN DATE Is
 v_frst_day Date;
Begin
  Select Min(F_date) --to_char(Min(From_date),'DD/MM/YYYY')
    Into v_frst_day
    From S_PRD_DTL;

  Return(v_frst_day);


 Exception
  When Others Then
      Begin
	      Select F_date
		Into v_frst_day
		From S_PRD_DTL
	       where PRD_NO=1;

	  Return(v_frst_day);
	Exception
	When Others Then
	 Return(Null);
      End;

End Get_Frst_Day;

--##-----------------------------------------------------------------------------##--
FUNCTION Get_Final_Day RETURN DATE Is
 v_fnal_day Date;
Begin
  Select Max(T_date) --to_char(Min(From_date),'DD/MM/YYYY')
    Into v_fnal_day
    From S_PRD_DTL;

  Return(v_fnal_day);


 Exception
  When Others Then
      Begin
	      Select T_date
		Into v_fnal_day
		From S_PRD_DTL
	       where PRD_NO=( Select max(PRD_NO) From S_PRD_DTL );

	  Return(v_fnal_day);
	Exception
	When Others Then
	 Return(Null);
      End;

End Get_Final_Day;

--##-----------------------------------------------------------------------------##--
FUNCTION Get_Sysdate  RETURN DATE Is
 S_SysDate Date;
Begin
  Select Sysdate
    Into S_SysDate
    From S_PRD_MST
   Where to_char(Sysdate,'YYYY') Between  F_yr_no and T_yr_no ;

  Return(S_SysDate);

 Exception
  When Others Then
    Begin
      Select Sysdate
	Into S_SysDate
	From S_PRD_DTL
       Where to_char(Sysdate,'DD/MM/YYYY') Between  F_DATE and T_DATE ;

       Return(S_SysDate);

     Exception
     when others then
      Select Max(t_date) Into S_SysDate From S_PRD_DTL;
       Return(S_SysDate);
    End;
End Get_Sysdate;
--##-----------------------------------------------------------------------------##--
FUNCTION Get_Curdate  RETURN DATE Is
 S_SysDate Date;
Begin
  Select Sysdate Into S_SysDate From dual;
  Return(S_SysDate);

 Exception When Others Then
  Return(Null);
End Get_Curdate;
--##-----------------------------------------------------------------------------##--
FUNCTION Get_Local_Cur RETURN VARCHAR2 Is
 V_Local_cur VARCHAR2(7);
Begin
  Select Cur_Code
    Into V_Local_cur
    From Ex_rate
   Where L_F=1;

  Return(V_Local_cur);

 Exception
 When Others Then
  Return(Null);
End Get_Local_Cur;
--##-----------------------------------------------------------------------------##--
Function Get_Cur_Rate (P_Acy	   In Varchar2	       ,
		     P_Rate_Type In Number Default  0	 ,
		     P_Date	 In Date   Default  Null ,
		     P_USR_NO	 In Number Default  NULL) Return Number Is
  V_Cur_Rate  Number ;
  V_Up_Date    Date  ;
  -- P_Type = 0  Get Current Rate
  -- P_Type = 1  Get Period Rate
 Begin
   If P_Acy Is Not Null Then
       -- Get Last Rate
	 If P_USR_NO is not null then
	      BEGIN
		 Select  Cur_Rate
		   Into V_Cur_Rate
		   From GLS_CRNCY_USR_LMT
		  Where Cur_Code = P_Acy
		    AND USER_NO=P_USR_NO
		    And  Rownum  <= 1 ;
	      EXCEPTION  WHEN OTHERS THEN
		 V_Cur_Rate:='';
	      END;
	  END IF;
	  IF NVL(V_Cur_Rate,0)=0 THEN
	     Begin
	       Select  Decode(Nvl(Cur_Rate_Pos,0),0,Nvl(Cur_Rate,1) ,Cur_Rate_Pos)
		 Into V_Cur_Rate
		From Ex_Rate
		 Where Cur_Code = P_Acy;
	     Exception
	       When No_Data_Found Then
		Return(Null);
	       When Others Then
		Raise_Application_Error(-20408,' Error When Get Currency rate = '||Sqlerrm) ;
	     End ;
	 END IF;
   End If;
   Return(V_Cur_Rate);
 End Get_Cur_Rate;
--##-----------------------------------------------------------------------------##--
FUNCTION Get_Update_Doc_Period (P_UserNo  In Number ,
				P_Ad_Date In Date   )  RETURN NUMBER Is

  V_Doc_Day_Prd Privilege_Fixed.Upd_Doc_Day_Prd%Type ;
  V_Doc_Hrs_Prd Privilege_Fixed.Upd_Doc_Hrs_Prd%Type ;
  V_Ret_Value	Number := 0 ;

Begin
    Select Upd_Doc_Day_Prd ,
	   Upd_Doc_Hrs_Prd
     Into V_Doc_Day_Prd ,
	  V_Doc_Hrs_Prd
      From Privilege_Fixed
     Where  U_Id = P_UserNo ;
    If Nvl(V_Doc_Day_Prd,0) <> 0 Then
       If P_Ad_Date + V_Doc_Day_Prd < Ias_Gen_Pkg.Get_Curdate  Then
	 V_Ret_Value := 1 ;
       End If ;
    End If ;
    If Nvl(V_Doc_HRS_Prd,0) <> 0 Then
       If P_Ad_Date + (V_Doc_HRS_Prd/24) < Ias_Gen_Pkg.Get_Curdate  Then
	 V_Ret_Value := 2 ;
       End If ;
    End If ;
    Return(V_Ret_Value);
 Exception
   When Others Then
    Return (0);
End Get_Update_Doc_Period  ;
--##-----------------------------------------------------------------------------##--
FUNCTION Get_Delete_Doc_Period (P_UserNo  In Number ,
				P_Ad_Date In Date   )  RETURN NUMBER Is
  V_Doc_Day_Prd Privilege_Fixed.Del_Doc_Day_Prd%Type ;
  V_Doc_Hrs_Prd Privilege_Fixed.Del_Doc_Hrs_Prd%Type ;
  V_Ret_Value	Number := 0 ;
Begin
    Select Del_Doc_Day_Prd ,
	   Del_Doc_Hrs_Prd
     Into V_Doc_Day_Prd ,
	  V_Doc_Hrs_Prd
      From Privilege_Fixed
     Where  U_Id = P_UserNo ;
    If Nvl(V_Doc_Day_Prd,0) <> 0 Then
       If P_Ad_Date + V_Doc_Day_Prd < Ias_Gen_Pkg.Get_Curdate  Then
	 V_Ret_Value := 1 ;
       End If ;
    End If ;
    If Nvl(V_Doc_HRS_Prd,0) <> 0 Then
       If P_Ad_Date + (V_Doc_HRS_Prd/24) < Ias_Gen_Pkg.Get_Curdate  Then
	 V_Ret_Value := 2 ;
       End If ;
    End If ;
    Return(V_Ret_Value);
 Exception
   When Others Then
    Return (0);
End Get_Delete_Doc_Period  ;
--##-----------------------------------------------------------------------------##--
FUNCTION Get_Usr_Fld_Prv ( P_Usr_No In Number ,
			   P_Frm_No In Number ,
			   P_Tab_Nm In Varchar2,
			   P_Fld_Nm In Varchar2)  RETURN NUMBER Is
v_Appr Number;
BEGIN

 Select 1
   Into v_Appr
   From ias_frm_fld_priv
  Where U_Id=P_Usr_No
    and Form_no=P_Frm_No
    and Tab_name=Upper(P_Tab_Nm)
    and Fld_name=Upper(P_Fld_Nm)
    and Priv_flag=1
    and RowNum<=1;

   Return(v_Appr);
 Exception
  When Others Then
   Return(0);
END Get_Usr_Fld_Prv;
--##-----------------------------------------------------------------------------##--
FUNCTION Get_Fld_Value (P_Tab_Nm In Varchar2 ,P_Fld_Nm In Varchar2,P_WHR In varchar2 Default Null)  RETURN VARCHAR2 Is

V_Fld_Value Varchar2(60);

Begin

    Execute Immediate ('Select '||P_Fld_Nm ||' From '|| P_Tab_Nm ||' '||P_WHR) Into  V_Fld_Value  ;

    Return (V_Fld_Value);

 Exception
  When others Then
   Return Null;
End Get_Fld_Value;
--##-----------------------------------------------------------------------------##--
FUNCTION Get_Flg_Nm (P_flg_code In varchar2,P_flg_value In Number ,P_Lng_no In Number Default 1)  RETURN VARCHAR2 Is
 v_flg_nm  varchar2(100);
BEGIN
 Select flg_desc
   Into v_flg_nm
   From s_flags
  Where lang_no=P_Lng_no
    and flg_code=P_flg_code
    and flg_value=P_flg_value
    and RowNum<=1;

   Return(v_flg_nm);
 Exception
   When Others Then
     Return(Null);
End Get_Flg_Nm;
--##-----------------------------------------------------------------------------##--
FUNCTION Get_Prompt (P_Lng_no In number ,P_Lbl_no In Number) RETURN VARCHAR2 Is
 v_cap_det varchar2(100);
BEGIN
 Select Caption_det
   Into v_cap_det
   From Ias_Sys.IAS_LABELS
  Where lang_no=P_Lng_no
    and Label_no=P_Lbl_no;

   Return(v_cap_det);
 Exception
   When Others Then
     Return(Null);
END Get_Prompt;

--##-----------------------------------------------------------------------------##--
FUNCTION  Get_Msg    (P_Lng_no In number ,P_Msg_no In Number) RETURN VARCHAR2 Is
 v_cap_det varchar2(250);
BEGIN
 Select Caption_det
   Into v_cap_det
   From Ias_Sys.IAS_MSGS
  Where lang_no=P_Lng_no
    and Msg_no=P_Msg_no;
   Return(v_cap_det);
 Exception When Others Then
  Return(Null);
END Get_Msg;
--##-----------------------------------------------------------------------------##--
FUNCTION  Get_Frm_Nm (P_Frm_No In Number,P_Lng_no In Number Default 1)	RETURN VARCHAR2 Is
v_Frm_Nm varchar2(60);
BEGIN
 Select Form_Name
   Into v_Frm_Nm
   From Ias_Form_Name
  Where Lang_no = p_Lng_no
    and Form_no=P_Frm_No
    and RowNum<=1;

   Return(v_Frm_Nm);
 Exception When Others Then
   Return(Null);
END Get_Frm_Nm;
--##-----------------------------------------------------------------------------##--
FUNCTION Get_Val (SqlStr VARCHAR2)  RETURN VARCHAR2 IS
 V_Val VARCHAR2(500);
Begin

Execute Immediate SqlStr Into V_Val;
 RETURN V_Val;

 Exception
  When No_Data_Found Then
   RETURN 0;
  When Others Then
   Raise_ApplICation_Error(-20406,'Error  Get_Val ' || '' || SqlErrm);
End Get_Val;
--##-----------------------------------------------------------------------------##--
FUNCTION GET_TXT_SRCH_FNC (P_TXT VARCHAR2) RETURN  VARCHAR2 RESULT_CACHE IS
    V_TXT VARCHAR2(4000);
BEGIN
    V_TXT:=REPLACE(RTRIM(LTRIM(P_TXT)),'  ',' ');
    BEGIN
	FOR I IN 1..LENGTH(V_TXT) LOOP
	    V_TXT:=REPLACE(RTRIM(LTRIM(V_TXT)),'  ',' ');
	    EXIT WHEN INSTR(V_TXT,'  ')=0;
	END LOOP;
    END;
    ----------------------------
	V_TXT:=TRIM(V_TXT);
	Declare
	    V_Cnt Number;
	Begin
	    SELECT 1 INTO V_CNT FROM NLS_DATABASE_PARAMETERS WHERE UPPER(PARAMETER)= 'NLS_CHARACTERSET' AND UPPER(VALUE) Like '%UTF%';
	    IF Nvl(V_CNT,0)=1 Then
	       RETURN V_TXT;
	    End IF;
	EXCEPTION WHEN OTHERS THEN
	    NULL;
	End;
	--V_TXT:=GET_SNGL_SPC(V_TXT);
	V_TXT:=REPLACE(V_TXT,chr(195),chr(199));
	V_TXT:=REPLACE(V_TXT,chr(197),chr(199));
	V_TXT:=REPLACE(V_TXT,chr(194),chr(199));
	V_TXT:=REPLACE(V_TXT,chr(193),chr(199));
	V_TXT:=REPLACE(V_TXT,chr(198),chr(199));
	V_TXT:=REPLACE(V_TXT,chr(236),chr(199));
	V_TXT:=REPLACE(V_TXT,chr(201),chr(229));
	V_TXT:=REPLACE(V_TXT,chr(196),chr(230));
	V_TXT:=REPLACE(V_TXT,chr(214),chr(217));
    --	RETURN (V_TXT);
  RETURN V_Txt;
EXCEPTION
  WHEN OTHERS THEN
     RETURN P_TXT;
END GET_TXT_SRCH_FNC ;
--##-----------------------------------------------------------------------------##--
FUNCTION Chk_Lock_Rcrd (P_Tab Varchar2,P_Whr  Varchar) Return Boolean Is
	  Row_Locked Exception;
	  Pragma     Exception_Init(Row_Locked, -54);
	  V_Count    Number:=0;
	BEGIN
	 Execute Immediate ('SELECT 1 FROM '||P_Tab ||' WHERE '||P_Whr||' AND ROWNUM <=1 FOR UPDATE NOWAIT ') Into V_Count;
	  Return False;
	
	EXCEPTION WHEN Row_Locked THEN
		     RETURN True;
		  WHEN Others THEN
		     RETURN False;	
	END Chk_Lock_Rcrd;
--##-----------------------------------------------------------------------------##--
End YS_GEN_PKG;
/

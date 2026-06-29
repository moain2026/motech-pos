-- =============================================
-- PACKAGE SPEC: IAS_PJ_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE IAS_PJ_Pkg as
 FUNCTION Get_PJ_Name(P_Pj_No In IAS_PROJECTS.PJ_NO%TYPE,P_Lng_no In Number) RETURN VARCHAR2;
 FUNCTION Get_PJ_Sub (P_Pj_No In IAS_PROJECTS.PJ_NO%TYPE) RETURN NUMBER;
 --FUNCTION Get_Grp_PJ_Name (P_Grp_No In IAS_PROJECTS_GROUP.GROUP_NO%TYPE,P_Lng_no In Number) RETURN VARCHAR2;
 FUNCTION Check_Ac_PJ (P_a_code In ACCOUNT.A_CODE%TYPE,P_Pj_No In IAS_PROJECTS.PJ_NO%TYPE) RETURN NUMBER ;
 FUNCTION Get_PJ_S_M (P_PJ_S_M In IAS_PROJECTS.PJ_SUB%TYPE) RETURN Number ;
 FUNCTION Check_Use_Actv	(P_Pj_No In IAS_PROJECTS.PJ_NO%TYPE) RETURN NUMBER ;
 FUNCTION Check_Pj_Actv (P_Pj_No In IAS_PROJECTS.PJ_NO%TYPE,P_Actv_No In IAS_ACTVTY.ACTV_NO%TYPE) RETURN NUMBER ;
 FUNCTION Get_One_Pj_Actv (P_Pj_No In IAS_PROJECTS.PJ_NO%TYPE,P_Usr_no In NUMBER) RETURN VARCHAR2 ;
 FUNCTION Get_One_CC_Pj (P_Pj_No In IAS_PROJECTS.PJ_NO%TYPE) RETURN VARCHAR2 ;
 PROCEDURE Chk_Pj_No ( P_Pj_No	    In IAS_PROJECTS.PJ_NO%TYPE,
			      P_Lng_No	   In LANG_DEF.LANG_NO%TYPE,
			      P_Usr_No	   In USER_R.U_ID%TYPE,
			      P_Scr_Typ    In NUMBER DEFAULT 1,
			      P_Doc_Date   In DATE   DEFAULT NULL,
			      P_A_CODE	   In ACCOUNT.A_CODE%TYPE  DEFAULT NULL,
			      P_CC_CODE    In COST_CENTERS.CC_CODE%TYPE     DEFAULT NULL,
			      P_ACTV_NO    In IAS_ACTVTY.ACTV_CODE%TYPE  DEFAULT NULL,
			      P_Pj_Nm	   In Out IAS_PROJECTS.PJ_A_NAME%TYPE,
			      P_Msg_No	   In Out NUMBER  ) ;
End IAS_PJ_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_PJ_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE Body IAS_PJ_Pkg as
--================================================================
FUNCTION Get_PJ_Name (P_Pj_No In IAS_PROJECTS.PJ_NO%TYPE,P_Lng_no In Number) RETURN VARCHAR2 Is
  v_name IAS_PROJECTS.PJ_A_NAME%TYPE;
 Begin
	 select Decode(P_Lng_no,1,pj_a_name,nvl(Pj_e_name,Pj_a_name))
	   Into v_name
	   From IAS_PROJECTS
	  where Pj_No=P_Pj_No
	    and RowNum<=1;
	
	 RETURN(v_name);
	
	Exception
	when others then
	  RETURN(Null);
End Get_PJ_Name ;
--===========================================================================================
FUNCTION Get_PJ_Sub (P_Pj_No In IAS_PROJECTS.PJ_NO%TYPE) RETURN NUMBER Is
  cnt Number;
 Begin
	
	 Select nvl(Pj_Sub,0)
	   Into cnt
	   From IAS_PROJECTS
	  where Pj_No=P_Pj_No
	    and RowNum<=1;
	
	 RETURN(cnt);
	
	Exception
	when others then
	  RETURN(Null);
End Get_PJ_Sub;
--===========================================================================================
/*FUNCTION Get_Grp_PJ_Name (P_Grp_No In IAS_PROJECTS_GROUP.GROUP_NO%TYPE,P_Lng_no In Number) RETURN VARCHAR2 Is
  v_name IAS_PROJECTS_GROUP.GROUP_A_NAME%TYPE;
 Begin
	 select Decode(P_Lng_no,1,group_a_name,nvl(group_e_name,group_a_name))
	   Into v_name
	   From IAS_PROJECTS_GROUP
	  where GROUP_NO=P_Grp_No;
	
	 RETURN(v_name);
	
	Exception
	when others then
	  RETURN(Null);
End Get_Grp_PJ_Name ;*/
--===========================================================================================
FUNCTION  Check_Ac_PJ (P_a_code In ACCOUNT.A_CODE%TYPE,P_Pj_No In IAS_PROJECTS.PJ_NO%TYPE) RETURN NUMBER Is
cnt	Number;
v_pj_ac Number;
Begin


 /*Begin
   Select 1
    Into cnt
    From IAS_ACCOUNT_PJ
   Where a_code = P_a_code
     and RowNum<=1;
 Exception
  When Others Then
    cnt:=0;
  End;

 If P_Pj_No Is Not Null Then

	 If cnt > 0 Then
	
	  Select 1
	    Into v_pj_ac
	    From IAS_ACCOUNT_PJ
	   Where a_code = P_a_code
	     and pj_no= P_Pj_No
	     and RowNum<=1;
	 Else
	   v_pj_ac:=2;
	 End if;
 Else
    if cnt = 0 Then
       v_pj_ac:=2;
    else
       v_pj_ac:=cnt;
    end if;
 End If;
      */
 RETURN(v_pj_ac);

 Exception
  When Others Then
    RETURN(0);
End;
--===========================================================================================
 FUNCTION Get_PJ_S_M (P_PJ_S_M In IAS_PROJECTS.PJ_SUB%TYPE) RETURN Number Is
cnt Number;
 Begin
	 Select Decode(Count(Distinct PJ_LEVEL),1,0,Min(PJ_Level))
	   Into cnt
	   From IAS_PROJECTS
	  where Pj_Sub=P_Pj_s_m;
	
	 RETURN(cnt);
	
 Exception
	when others then
	  RETURN(null);
End Get_PJ_S_M ;
--===========================================================================================
FUNCTION  Check_Use_Actv	(P_Pj_No In IAS_PROJECTS.PJ_NO%TYPE) RETURN NUMBER Is
 V_Use_Actv Number;
Begin
  Select nvl(Use_Actv,1)
    Into v_Use_Actv
    From Ias_Projects
   Where Pj_No = P_Pj_No
     and RowNum<=1;

     Return(v_Use_Actv);
 Exception When Others Then
    Return(1);
End Check_Use_Actv;
--===========================================================================================
FUNCTION Check_Pj_Actv (P_Pj_No In IAS_PROJECTS.PJ_NO%TYPE,P_Actv_No In IAS_ACTVTY.ACTV_NO%TYPE) RETURN
NUMBER IS
 V_Cnt	     Number;
 V_Pj_Actv Number;
Begin

   /*  Begin
       Select 1
	Into V_Cnt
	From IAS_Pj_Actv
       Where Pj_No = P_Pj_No
	 and RowNum<=1;
     Exception
      When Others Then
	V_Cnt:=0;
      End;

     If P_Actv_No Is Not Null Then

    	 If V_Cnt > 0 Then
	
    	  Select 1
    	    Into v_pj_actv
    	    From IAS_Pj_Actv
    	   Where Pj_No = P_Pj_No
    	     and Actv_no= P_Actv_No
    	     and RowNum<=1;
    	 Else
    	   v_pj_actv:=2;
    	 End if;
     Else
	if V_cnt = 0 Then
	   v_pj_actv:=2;
	else
	   v_pj_actv:=v_cnt;
	end if;
     End If;
      */
     RETURN(v_pj_actv);

 Exception
  When Others Then
    RETURN(0);
End Check_Pj_Actv ;
--===========================================================================================
FUNCTION Get_One_Pj_Actv (P_Pj_No In IAS_PROJECTS.PJ_NO%TYPE,P_Usr_no In NUMBER) RETURN VARCHAR2 Is

   v_Actv VARCHAR2(15);
 Begin

--	Select Actv_No Into v_Actv From Ias_Pj_Actv where Pj_No=P_Pj_No;
		   	
	RETURN(v_Actv);
	
 Exception
	when others then
	  RETURN(Null);
End Get_One_Pj_Actv ;
--===========================================================================================
FUNCTION Get_One_Cc_Pj (P_Pj_No In IAS_PROJECTS.PJ_NO%TYPE) RETURN VARCHAR2 Is
   v_Cc VARCHAR2(30);
 Begin
--	Select Cc_Code Into v_Cc From Ias_Cc_Pj where Pj_No=P_Pj_No;
		   	
	RETURN(v_Cc);
	
 Exception
	when others then
	  RETURN(Null);
End Get_One_Cc_Pj;
--===========================================================================================
PROCEDURE Chk_Pj_No ( P_Pj_No	   In IAS_PROJECTS.PJ_NO%TYPE,
		      P_Lng_No	   In LANG_DEF.LANG_NO%TYPE,
		      P_Usr_No	   In USER_R.U_ID%TYPE,
		      P_Scr_Typ    In NUMBER DEFAULT 1,
		      P_Doc_Date   In DATE   DEFAULT NULL,
		      P_A_CODE	   In ACCOUNT.A_CODE%TYPE  DEFAULT NULL,
		      P_CC_CODE    In COST_CENTERS.CC_CODE%TYPE     DEFAULT NULL,
		      P_ACTV_NO    In IAS_ACTVTY.ACTV_CODE%TYPE  DEFAULT NULL,
		      P_Pj_Nm	   In Out IAS_PROJECTS.PJ_A_NAME%TYPE,
		      P_Msg_No	   In Out NUMBER  ) Is

v_Inc		 Number;
v_prv_scr	 Number;
v_prv_rprt	 Number;

 -- P_Scr_Typ = ( 1,2,3 = SCR , 4 = Report , 5 = Query)

BEGIN
  IF P_USR_NO = 1 THEN	-- USR ADMIN

      Select Decode(P_Lng_No,1,M.PJ_A_NAME,nvl(M.PJ_A_NAME,M.PJ_E_NAME)), nvl(M.INACTIVE,0), 1 ADD_FLAG,1 VIEW_FLAG
	Into P_pj_Nm,v_Inc,v_prv_scr,v_prv_rprt
	From IAS_PROJECTS M
       Where M.PJ_NO   = P_PJ_NO
	 and M.PJ_SUB = 1
	 and RowNum<=1;
  ELSE
    /*	Select Decode(P_Lng_No,1,M.PJ_A_NAME,nvl(M.PJ_A_NAME,M.PJ_E_NAME)), nvl(M.INACTIVE,0), nvl(D.ADD_FLAG,0),nvl(D.VIEW_FLAG,0)
	Into P_pj_Nm,v_Inc,v_prv_scr,v_prv_rprt
	From IAS_PROJECTS M,IAS_PRIV_PROJECTS D
       Where M.PJ_NO = D.PJ_NO
	 and M.PJ_SUB = 1
	 and M.PJ_NO = P_PJ_NO
	 and D.U_ID  = P_Usr_No
	 and RowNum<=1;
  */
     NULL;
  END IF;

    IF P_scr_typ Not In (4,5) and v_Inc <> 0 THEN
       P_Msg_No:=1306 ;
    END IF;


    IF P_scr_typ not in (4,5) and v_prv_scr = 0 THEN
       P_Msg_No:=983;
    ElsIF P_scr_typ In (4,5) and v_prv_rprt = 0 THEN
       P_Msg_No:=983;
    END IF;

    IF P_scr_typ Not In ( 4 ,5)  Then
     /*  IF   P_A_CODE IS NOT NULL AND P_PJ_NO IS NOT NULL THEN

	     IF IAS_ACODE_Pkg.Chk_Ac_Conn  (P_CONN_TYP => 2  ,P_a_code =>P_A_CODE, P_conn_code =>  P_PJ_NO)  = 0 THEN
		 P_Msg_No:=1304;
	     END IF;

       END IF;

       IF   P_CC_CODE IS NOT NULL AND P_PJ_NO IS NOT NULL THEN

	     IF Ias_Cc_Code_Pkg.Check_Cc_Pj (P_Cc_Code => P_CC_CODE ,P_Pj_No =>  P_PJ_NO) = 0 THEN
		P_Msg_No:=736;
	  END IF;

       END IF;*/
       NULL;

    End If;

 Exception
  When Others Then
    P_Msg_No:=1305;
END Chk_Pj_No;
--===========================================================================================
End IAS_PJ_Pkg;
/

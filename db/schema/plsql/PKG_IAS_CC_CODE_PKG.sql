-- =============================================
-- PACKAGE SPEC: IAS_CC_CODE_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE IAS_Cc_Code_Pkg as
 FUNCTION Get_Cc_Name  (P_cc_code In COST_CENTERS.CC_CODE%TYPE,P_Lng_no In Number) RETURN VARCHAR2;
 FUNCTION Get_CC_No    (P_cc_code In COST_CENTERS.CC_CODE%TYPE)   RETURN NUMBER ;
 FUNCTION Get_CC_SER   (P_cc_code In COST_CENTERS.CC_CODE%TYPE)   RETURN NUMBER ;
 FUNCTION Get_C_S_M    (P_C_S_M In Cost_centers.C_S_M%TYPE) RETURN Number;
 End IAS_Cc_Code_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_CC_CODE_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY IAS_Cc_Code_Pkg as

--================================================================
FUNCTION Get_Cc_Name (P_cc_code In COST_CENTERS.CC_CODE%TYPE,P_Lng_no In Number) RETURN VARCHAR2 Is
  v_name varchar2(60);
 Begin
     select Decode(P_Lng_no,1,cc_a_name,nvl(cc_e_name,cc_a_name))
       Into v_name
       From cost_centers
      where cc_code=P_cc_code
	and RowNum<=1;

     RETURN(v_name);

    Exception
    when others then
      RETURN(Null);
End Get_Cc_Name ;
--===========================================================================================
FUNCTION Get_CC_No (P_cc_code In COST_CENTERS.CC_CODE%TYPE)   RETURN NUMBER Is
 v_ccno Number;
Begin

  Select cc_no
    Into v_ccno
    From cost_centers
     where cc_code=P_cc_code
       and RowNum<=1;

   RETURN(v_ccno);

 Exception
  When Others Then
   RETURN(Null);
End Get_CC_No;
--===============================================================
FUNCTION Get_CC_SER (P_cc_code In COST_CENTERS.CC_CODE%TYPE)   RETURN NUMBER Is
 v_ccsr Number;
Begin
  Select c_sr
    Into v_ccsr
    From cost_centers
     where cc_code=P_cc_code
       and RowNum<=1;

   RETURN(v_ccsr);

 Exception
  When Others Then
   RETURN(Null);
End Get_CC_SER;
--===============================================================
FUNCTION Get_C_S_M (P_C_S_M In cost_centers.c_S_m%TYPE) RETURN Number Is
cnt Number;
 Begin
     Select Decode(Count(Distinct C_LEVEL),1,0,Min(C_Level))
       Into cnt
       From cost_centers
      where C_s_m=P_c_s_m;
     RETURN(cnt);
 Exception
    when others then
      RETURN(null);
End Get_c_S_M ;
--===============================================================
End IAS_Cc_Code_Pkg;
/

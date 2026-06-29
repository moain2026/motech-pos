-- =============================================
-- PACKAGE SPEC: IAS_USR_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE IAS_Usr_Pkg as
 FUNCTION Get_Usr_Nm ( P_Usr_No In USER_R.U_ID%TYPE,P_Lng_no In Number Default 1 ) Return VARCHAR2;
 FUNCTION Get_Usr_St (P_Usr_No In USER_R.U_ID%TYPE) Return NUMBER;
 FUNCTION Get_Usr_Def_Val ( P_Usr_No In USER_R.U_ID%TYPE , P_Def_Type In Varchar2) Return VARCHAR2;
 FUNCTION Chk_Usr_Frm_Prv (P_UserNo In Number , P_Frm_no In Number, P_Priv_Type In Varchar2)  RETURN NUMBER ;
 FUNCTION Chk_Usr_CB_Prv (P_UserNo In Number , P_Cb_Type In Number ,P_Cb_No In Number, P_a_cy In Varchar2,P_Priv_Type In Varchar2)  RETURN NUMBER;
 FUNCTION Chk_Usr_Cst_Prv (P_UserNo In Number , P_c_code In VARCHAR2,  P_a_cy In VARCHAR2,P_Priv_Type In Varchar2)  RETURN NUMBER ;
 FUNCTION Chk_Usr_Wc_Prv (P_UserNo In Number , P_w_code In NUMBER, P_Priv_Type In Varchar2)  RETURN NUMBER ;
 FUNCTION Chk_Usr_Gc_Prv (P_UserNo In Number , P_G_code In Varchar2,P_Priv_Type In Varchar2)  RETURN NUMBER ;
 FUNCTION Chk_Usr_Show_Prv(P_UserNo In Number ,P_T_U_ID In NUMBER)  RETURN NUMBER ;
 FUNCTION Get_Usr_Def_Rep ( P_Usr_No In USER_R.U_ID%TYPE , P_Form_no In FORM_DETAIL.FORM_NO%TYPE ) Return NUMBER;
 FUNCTION Chk_Usr_Brn_Prv (P_UserNo In Number , P_Brn_No In Number,P_Priv_Type In Varchar2)  RETURN NUMBER ;
 FUNCTION CHK_USR ( P_USR_NO IN USER_R.U_ID%TYPE,P_PASSWORD IN VARCHAR2 ,P_LNG_NO IN NUMBER DEFAULT 1) RETURN VARCHAR2 ;
 FUNCTION Chk_Pass_Complxty ( P_Pass	   varchar2,
			     P_Min_len	  integer Default 1,
			     P_letter	  integer Default 0,
			     P_upper	  integer Default 0,
			     P_lower	  integer Default 0,
			     P_Digit	  integer Default 0,
			     P_Special	  integer Default 0) RETURN Number;
FUNCTION GET_USR_FLD_DFLT_VAL_FNC(P_U_ID	IN USER_R.U_ID%TYPE ,
				  P_FLD_NM	IN S_FLD_DFLT_USR.FLD_NM%TYPE) RETURN VARCHAR2;
FUNCTION GET_USR_PRIVILEGE_FIXED_FNC (P_U_ID	    IN USER_R.U_ID%TYPE ,
				      P_FLD_NM	    IN VARCHAR2 ) RETURN NUMBER;
FUNCTION GET_PRV_FXD_FLD_POS_FNC (P_U_ID	IN USER_R.U_ID%TYPE ,
				  P_FLD_NM	IN VARCHAR2) RETURN NUMBER;
FUNCTION GET_PRV_FXD_FLD_NMBR_FNC(P_U_ID	IN USER_R.U_ID%TYPE ,
				  P_FLD_NM	IN VARCHAR2) RETURN NUMBER;
FUNCTION GET_PRV_FXD_FLD_CHR_FNC (P_U_ID	IN USER_R.U_ID%TYPE ,
				  P_FLD_NM	IN VARCHAR2) RETURN VARCHAR2;
FUNCTION GET_CUR_RATE (P_ACY	   IN VARCHAR2		   ,
		       P_RATE_TYPE IN NUMBER DEFAULT  0    ,
		       P_DATE	   IN DATE   DEFAULT  NULL ,
		       P_USR_NO    IN NUMBER DEFAULT  NULL) RETURN NUMBER ;
End IAS_Usr_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_USR_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE Body IAS_Usr_Pkg as

--================================================================
FUNCTION Get_Usr_Nm (P_Usr_No In USER_R.U_ID%TYPE,P_Lng_no In Number Default 1 ) Return VARCHAR2 Is
  v_name varchar2(60);
 Begin
	
	 Select Decode(P_Lng_no,1,u_a_name,nvl(u_e_name,u_a_name))
	   Into v_name
	   From User_r
	  where U_id = P_Usr_No
	    and RowNum<=1;
	
	 Return(v_name);
	
 Exception
	when others then
	  Return(Null);
End Get_Usr_Nm ;

--================================================================
FUNCTION Get_Usr_St (P_Usr_No In USER_R.U_ID%TYPE) Return NUMBER Is
  v_inc 	Number;
 Begin
	
	 Select nvl(Inactive,0)
	   Into v_inc
	   From User_r
	  where U_id = P_Usr_No
	    and RowNum<=1;
	
	 Return(v_inc);
	
 Exception
	when others then
	  Return(0);
End Get_Usr_St ;
--================================================================
FUNCTION Get_Usr_Def_Val ( P_Usr_No In USER_R.U_ID%TYPE , P_Def_Type In Varchar2) Return VARCHAR2 Is

  v_val varchar2(30);

  -- P_Def_Type = W_CODE , Cash_No

 Begin

 /* If P_Def_Type = 'W_CODE' Then
	
		 Select W_CODE_DEF
		   Into v_val
		   From User_r
		  where U_Id = P_Usr_No
		    and Exists (Select 1 From Privilege_wh
				 Where U_id = P_Usr_No
				   and w_code=User_r.W_CODE_DEF
				   and add_flag = 1
				   and RowNum<=1)
		    and RowNum<=1;	
	ElsIf P_Def_Type = 'CASH_NO' Then
		 Select Cash_No_DEF
		   Into v_val
		   From User_r
		  where U_Id = P_Usr_No
		    and Exists (Select 1 From Priv_Cash
				 Where U_id = P_Usr_No
				   and cash_no=User_r.CASH_NO_DEF
		       and cash_type = 1
				   and add_flag = 1
				   and RowNum<=1)
		    and RowNum<=1;		
	End If;*/
	 Return(v_val);	
 Exception
	when others then
	  Return(Null);
End Get_Usr_Def_Val ;
--===============================================================
FUNCTION Chk_Usr_Frm_Prv (P_UserNo In Number , P_Frm_no In Number, P_Priv_Type In Varchar2)  RETURN NUMBER Is
  v_Flg Number;
BEGIN
If Upper(P_Priv_Type) = 'INC' Then
    Select nvl(Include_Flag,0)
      Into v_Flg
      From Privilege
     Where U_Id    = P_UserNo
       and Form_no = P_Frm_No
       and Rownum <=1 ;
ElsIf Upper(P_Priv_Type) = 'ADD' Then
    Select nvl(Ad_Flag,0)
      Into v_Flg
      From Privilege
     Where U_Id    = P_UserNo
       and Form_no = P_Frm_No
       and Rownum <=1 ;

ElsIf Upper(P_Priv_Type) = 'MOD' Then
    Select nvl(Mod_Flag,0)
      Into v_Flg
      From Privilege
     Where U_Id    = P_UserNo
       and Form_no = P_Frm_No
       and Rownum <=1 ;
ElsIf Upper(P_Priv_Type) = 'DEL' Then
    Select nvl(Del_Flag,0)
      Into v_Flg
      From Privilege
     Where U_Id    = P_UserNo
       and Form_no = P_Frm_No
       and Rownum <=1 ;
ElsIf Upper(P_Priv_Type) = 'VIEW' Then
    Select nvl(View_Flag,0)
      Into v_Flg
      From PRIVILEGE
     Where U_Id    = P_UserNo
       and Form_no = P_Frm_No
       and Rownum <=1 ;
ElsIf Upper(P_Priv_Type) = 'PRINT' Then
    Select nvl(Print_Flag,0)
      Into v_Flg
      From Privilege
     Where U_Id    = P_UserNo
       and Form_no = P_Frm_No
       and Rownum <=1 ;
ElsIf Upper(P_Priv_Type) = 'VWREP' Then
    Select nvl(VWREP_FLAG,0)
      Into v_Flg
      From Privilege
     Where U_Id    = P_UserNo
       and Form_no = P_Frm_No
       and Rownum <=1 ;
End If;
    Return(v_Flg);
 Exception
   When others then
    Return (0);
End Chk_Usr_Frm_Prv;
--===============================================================
FUNCTION Chk_Usr_CB_Prv (P_UserNo In Number , P_Cb_Type In Number ,P_Cb_No In Number, P_a_cy In Varchar2,P_Priv_Type In Varchar2)  RETURN NUMBER Is

  v_Flg Number;

BEGIN
If Upper(P_Priv_Type) = 'ADD' Then
    Select nvl(Add_Flag,0)
      Into v_Flg
      From Priv_Cash
     Where U_Id    = P_UserNo
       and Cash_no = P_Cb_No
       and A_cy = P_a_cy
       and Cash_Type = P_Cb_Type
       and Rownum <=1 ;
ElsIf Upper(P_Priv_Type) = 'VIEW' Then
    Select nvl(View_Flag,0)
      Into v_Flg
      From Priv_Cash
     Where U_Id    = P_UserNo
       and Cash_no = P_Cb_No
       and A_cy = P_a_cy
       and Cash_Type = P_Cb_Type
       and Rownum <=1 ;
End If;

    Return(v_Flg);
 Exception
   When others then
    Return (0);
End Chk_Usr_CB_Prv;
--===============================================================
FUNCTION Chk_Usr_Cst_Prv (P_UserNo In Number , P_c_code In VARCHAR2,  P_a_cy In VARCHAR2,P_Priv_Type In Varchar2)  RETURN NUMBER Is

  v_Flg Number;
BEGIN
If Upper(P_Priv_Type) = 'ADD' Then
    Select nvl(Add_Flag,0)
      Into v_Flg
      From IAS_PRIV_CUSTOMER
     Where U_Id    = P_UserNo
       and c_code = P_c_code
       and A_cy = P_a_cy
       and Rownum <=1 ;
ElsIf Upper(P_Priv_Type) = 'VIEW' Then
    Select nvl(View_Flag,0)
      Into v_Flg
      From IAS_PRIV_CUSTOMER
     Where U_Id    = P_UserNo
       and c_code = P_c_code
       and A_cy = P_a_cy
       and Rownum <=1 ;
End If;

    Return(v_Flg);
 Exception
   When others then
    Return (0);
End Chk_Usr_Cst_Prv;
--===============================================================
FUNCTION Chk_Usr_Wc_Prv (P_UserNo In Number , P_W_code In NUMBER,P_Priv_Type In Varchar2)  RETURN NUMBER Is

  v_Flg Number:=0;
BEGIN
If Upper(P_Priv_Type) Is Not Null Then
    Select Decode(Upper(P_Priv_Type),'ADD',nvl(Add_Flag,0),nvl(View_Flag,0))
      Into v_Flg
      From PRIVILEGE_WH
     Where U_Id   = P_UserNo
       and W_code = P_W_code
       and Rownum <=1 ;
End If;
    Return(v_Flg);
 Exception
   When others then
    Return (0);
End Chk_Usr_Wc_Prv;
--===============================================================
FUNCTION Chk_Usr_Gc_Prv (P_UserNo In Number , P_G_code In Varchar2,P_Priv_Type In Varchar2)  RETURN NUMBER Is

  v_Flg Number:=0;
BEGIN
If Upper(P_Priv_Type) Is Not Null Then
    Select Decode(Upper(P_Priv_Type),'ADD',nvl(Add_Flag,0),nvl(View_Flag,0))
      Into v_Flg
      From PRIVILEGE_Gc
     Where U_Id   = P_UserNo
       and G_code = P_G_code
       and Rownum <=1 ;
End If;

    Return(v_Flg);
 Exception
   When others then
    Return (0);
End Chk_Usr_Gc_Prv;
--===============================================================
 FUNCTION Chk_Usr_Show_Prv(P_UserNo In Number ,P_T_U_ID In NUMBER)  RETURN NUMBER Is

  v_Flg Number:=0;

BEGIN
    Select nvl(PRIV_FLAG,0)
      Into v_Flg
      From IAS_SHW_DOC_PRIV
     Where U_Id   = P_UserNo
       and T_U_ID = P_T_U_ID
       and Rownum <=1 ;
    Return(v_Flg);
 Exception
   When others then
    Return (0);
End Chk_Usr_Show_Prv;
--===============================================================
FUNCTION Get_Usr_Def_Rep ( P_Usr_No In USER_R.U_ID%TYPE , P_Form_no In FORM_DETAIL.FORM_NO%TYPE ) Return NUMBER Is
 v_def	Number;
BEGIN

  Select REP_SMPLE_NO
    Into v_def
    From IAS_REP_SMPLE_USER
   Where U_id = P_Usr_No
     and Form_no = P_Form_no
     and REP_SMPLE_DFLT  = 1
     and nvl(PRIV_FLAG,0)= 1
     and RowNum<=1;

     Return (v_def);

 Exception
	when others then
	  Return(Null);
END Get_Usr_Def_Rep;
--===============================================================
FUNCTION Chk_Usr_Brn_Prv (P_UserNo In Number , P_Brn_No In Number,P_Priv_Type In Varchar2)  RETURN NUMBER Is

  v_Flg Number:=0;
BEGIN
If Upper(P_Priv_Type) Is Not Null Then
    Select Decode(Upper(P_Priv_Type),'ADD',nvl(Add_Flag,0),nvl(View_Flag,0))
      Into v_Flg
      From S_BRN_USR_PRIV
     Where U_Id   = P_UserNo
       and Brn_No = P_Brn_No
       and Rownum <=1 ;
End If;

    Return(v_Flg);
 Exception
   When others then
    Return (0);
End Chk_Usr_Brn_Prv;
--===============================================================
FUNCTION CHK_USR ( P_USR_NO IN USER_R.U_ID%TYPE,P_PASSWORD IN VARCHAR2 ,P_LNG_NO IN NUMBER DEFAULT 1) RETURN VARCHAR2 IS
    V_Inactive	User_R.Inactive%Type;
    V_Pwd	User_R.Password%Type;
    V_S_Sdate	User_R.S_Sdate%Type;
    V_S_Edate	User_R.S_Edate%Type;

Begin

     SELECT NVL(INACTIVE,0) ,
	    PASSWORD ,
	    S_SDATE,
	    S_EDATE
       INTO V_INACTIVE,
	    V_PWD,
	    V_S_SDATE,
	    V_S_EDATE
       FROM USER_R
      WHERE U_ID = P_USR_NO
	AND ROWNUM<=1;

    IF V_PWD <> Ias_Get_Enc_Pass_fnc( P_Pass=>P_PASSWORD) THEN
	 RETURN(IAS_GEN_PKG.GET_MSG(P_LNG_NO =>P_LNG_NO,P_MSG_NO=>452));
    ELSIF V_INACTIVE =1 THEN	 	
	 RETURN(IAS_GEN_PKG.GET_MSG(P_LNG_NO =>P_LNG_NO,P_MSG_NO=>380 ));
    ELSIF V_S_SDATE  IS NOT NULL AND V_S_EDATE	IS NOT NULL AND SYSDATE NOT BETWEEN V_S_SDATE AND V_S_EDATE THEN
    	 RETURN(750);
	 RETURN(IAS_GEN_PKG.GET_MSG(P_LNG_NO =>P_LNG_NO, P_MSG_NO=>750 ));
    ELSE
	 RETURN(NULL);
    END IF;

 EXCEPTION
  WHEN OTHERS THEN
    RETURN(IAS_GEN_PKG.GET_MSG(P_LNG_NO =>P_LNG_NO, P_MSG_NO=>453 ));
END CHK_USR;
--===============================================================
FUNCTION Chk_Pass_Complxty ( P_Pass	  varchar2,
			     P_Min_len	  integer Default 1,
			     P_letter	  integer Default 0,
			     P_upper	  integer Default 0,
			     P_lower	  integer Default 0,
			     P_Digit	  integer Default 0,
			     P_Special	  integer Default 0 ) RETURN Number IS
     /* *************************************************************************
    Rem BEGIN Password Verification Functions
    Rem *************************************************************************

    Rem  Function: "complexity_check" - Verifies the complexity
    Rem 	   of a password string.

	 Return Number OF Error

    Rem  If not NULL, each of the following parameters specifies the minimum
    Rem  number of characters of the corresponding type.
    Rem  P_Min_len -  Minimum Count Of All characters (string length)
    Rem  P_letter  -  All characters not special characters and Numeric
    Rem  P_upper   -  Uppercase letters A-Z
    Rem  P_lower   -  Lowercase letters a-z
    Rem  P_digit   -  Numeric characters 0-9
    Rem  P_special -  All characters Like '~!@#$%^&*)(_+=-|\[]{}"'''';:/.,?><'

    Rem ************************************************************************* */

   -- Err NO - Desc
   ------------------------------------------------------------------------
   --  1 -  Password length more than 20'
   --  2 -  Password length less than Minimum Password'
   --  3 -  Password must contain at least ' || P_letter || ' letter(s)
   --  4 -  Password must contain at least ' || P_upper || ' uppercase character(s)'
   --  5 -  Password must contain at least ' || P_lower || ' lowercase character(s)''
   --  6 -  Password must contain at least ' || P_digit || ' digit(s)'
   --  7 -  Password must contain at least ' || P_special || ' special character(s)'
   --------------------------------------------------------------------------

   digit_array varchar2(10) := '0123456789';
   special_array varchar2(33) := '~!@#$%^&*)(_+=-|\[]{}"'''';:/.,?><';
   cnt_letter integer := 0;
   cnt_upper integer := 0;
   cnt_lower integer := 0;
   cnt_digit integer := 0;
   cnt_special integer := 0;
   len INTEGER := NVL (length(P_Pass), 0);
   i integer ;
   ch CHAR(1);

BEGIN
   -- Check that the password length does not exceed max DB pwd len
   IF len > 20 THEN
      Return(1);
   END IF;

   -- Check that the password length does exceed Minimum pwd len
   IF len < P_Min_len THEN
      Return(2);
   END IF;

   -- Classify each character in the password.
   FOR i in 1..len LOOP
      ch := substr(P_Pass, i, 1);
      IF instr(digit_array, ch) > 0 THEN
	 cnt_digit := cnt_digit + 1;
      ELSIF instr(special_array, NLS_LOWER(ch)) > 0 THEN
	 cnt_special := cnt_special + 1;
      ELSE
	 cnt_letter := cnt_letter + 1;
	 IF ch = NLS_LOWER(ch) THEN
	    cnt_lower := cnt_lower + 1;
	 ELSE
	    cnt_upper := cnt_upper + 1;
	 END IF;
      END IF;
   END LOOP;


   IF P_letter!=0 AND cnt_letter < P_letter THEN
      Return(3);--raise_application_error(-20022, 'Password must contain at least ' || P_letter || ' letter(s)');
   END IF;
   IF P_upper!=0 AND cnt_upper < P_upper THEN
      Return(4);--raise_application_error(-20023, 'Password must contain at least ' || P_upper || ' uppercase character(s)');
   END IF;
   IF P_lower!=0 AND cnt_lower < P_lower THEN
      Return(5);--raise_application_error(-20024, 'Password must contain at least ' || P_lower || ' lowercase character(s)');
   END IF;
   IF P_digit!=0 AND cnt_digit < P_digit THEN
      Return(6);--raise_application_error(-20025, 'Password must contain at least ' || P_digit || ' digit(s)');
   END IF;
   IF P_special!=0 AND cnt_special < P_special THEN
      Return(7);--raise_application_error(-20026, 'Password must contain at least ' || P_special || ' special character(s)');
   END IF;

   RETURN(0);
END Chk_Pass_Complxty;

FUNCTION GET_USR_FLD_DFLT_VAL_FNC(P_U_ID	IN USER_R.U_ID%TYPE ,
				  P_FLD_NM	IN S_FLD_DFLT_USR.FLD_NM%TYPE) RETURN VARCHAR2 IS

    V_FLD_VAL	 S_FLD_DFLT_USR.FLD_VAL%TYPE;
BEGIN

    SELECT FLD_VAL INTO V_FLD_VAL
      FROM S_V_FLD_DFLT_USR M, S_FLD_DFLT D
     WHERE M.U_ID   = P_U_ID
       AND M.FLD_NM = P_FLD_NM
       AND M.FLD_NM = D.FLD_NM
       AND NVL(D.FLD_ST_FLG,0)=1
       AND ROWNUM<=1;

    RETURN(V_FLD_VAL);

EXCEPTION WHEN OTHERS THEN
   RETURN(NULL);
END GET_USR_FLD_DFLT_VAL_FNC;
--===============================================================
FUNCTION GET_USR_PRIVILEGE_FIXED_FNC ( P_U_ID	     IN USER_R.U_ID%TYPE ,
				       P_FLD_NM      IN VARCHAR2 ) RETURN NUMBER IS
    V_FLD_VAL	 NUMBER;
BEGIN
    EXECUTE IMMEDIATE ('SELECT FLD_VAL FROM POS_S_FLD_PRV_FXD_USR WHERE UPPER(FLD_NM)='''||UPPER(P_FLD_NM) ||''' AND U_ID = '||P_U_ID ||' AND ROWNUM<=1') INTO	V_FLD_VAL  ;

    RETURN (V_FLD_VAL);

EXCEPTION WHEN OTHERS THEN
   RETURN(NULL);
END GET_USR_PRIVILEGE_FIXED_FNC;
--===============================================================
FUNCTION GET_PRV_FXD_FLD_POS_FNC (P_U_ID	IN USER_R.U_ID%TYPE ,
				  P_FLD_NM	IN VARCHAR2 ) RETURN NUMBER IS
    V_FLD_VAL	 NUMBER;
BEGIN
    EXECUTE IMMEDIATE ('SELECT FLD_VAL FROM POS_S_FLD_PRV_FXD_USR WHERE UPPER(FLD_NM)='''||UPPER(P_FLD_NM) ||''' AND U_ID = '||P_U_ID ||' AND ROWNUM<=1') INTO	V_FLD_VAL  ;

    RETURN (V_FLD_VAL);

EXCEPTION WHEN OTHERS THEN
   RETURN(NULL);
END GET_PRV_FXD_FLD_POS_FNC;
--===============================================================
FUNCTION GET_PRV_FXD_FLD_NMBR_FNC (P_U_ID	 IN USER_R.U_ID%TYPE ,
				   P_FLD_NM	 IN VARCHAR2 ) RETURN NUMBER IS
    V_FLD_VAL	 NUMBER;
BEGIN
    EXECUTE IMMEDIATE ('SELECT FLD_VAL FROM S_FLD_PRV_FXD_USR WHERE UPPER(FLD_NM)='''||UPPER(P_FLD_NM) ||''' AND U_ID = '||P_U_ID ||' AND ROWNUM<=1') INTO  V_FLD_VAL  ;

    RETURN (V_FLD_VAL);

EXCEPTION WHEN OTHERS THEN
   RETURN(NULL);
END GET_PRV_FXD_FLD_NMBR_FNC;
--===============================================================
FUNCTION GET_PRV_FXD_FLD_CHR_FNC (P_U_ID	IN USER_R.U_ID%TYPE ,
				  P_FLD_NM	IN VARCHAR2 ) RETURN VARCHAR2 IS
    V_FLD_VAL	 NUMBER;
BEGIN
    EXECUTE IMMEDIATE ('SELECT FLD_VAL FROM S_FLD_PRV_FXD_USR WHERE UPPER(FLD_NM)='''||UPPER(P_FLD_NM) ||''' AND U_ID = '||P_U_ID ||' AND ROWNUM<=1') INTO  V_FLD_VAL  ;

    RETURN (V_FLD_VAL);

EXCEPTION WHEN OTHERS THEN
   RETURN(NULL);
END GET_PRV_FXD_FLD_CHR_FNC;
--===============================================================
FUNCTION GET_CUR_RATE (P_ACY	   IN VARCHAR2	       ,
		     P_RATE_TYPE IN NUMBER DEFAULT  0	 ,
		     P_DATE	 IN DATE   DEFAULT  NULL ,
		     P_USR_NO	 IN NUMBER DEFAULT  NULL) RETURN NUMBER IS
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
--===============================================================
End IAS_Usr_Pkg;
/

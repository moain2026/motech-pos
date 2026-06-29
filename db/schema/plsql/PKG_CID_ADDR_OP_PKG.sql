-- =============================================
-- PACKAGE SPEC: CID_ADDR_OP_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE cid_addr_op_pkg
AS
   usr_addr_rcrd_sq	  NUMBER (9);
   usr_addr_typ 	  NUMBER (1);
   usr_addr_cat 	  NUMBER (1);
   usr_addr_cst_br_code   VARCHAR2 (30);
   usr_cntry_2_ltr_code   VARCHAR2 (2);
   usr_LANG_NO		  NUMBER (5);
   usr_LANG_CODE	  VARCHAR2 (5);

   FUNCTION get_cid_col_lbl (p_cntry_2_ltr     VARCHAR2 DEFAULT NULL,
			     p_lang_code       VARCHAR2 DEFAULT NULL,
			     p_lang_id	       NUMBER DEFAULT 1,
			     p_colmn_name      VARCHAR2 DEFAULT NULL,
			     p_cid_code        VARCHAR2 DEFAULT NULL,
			     p_cid_sub_code    NUMBER DEFAULT NULL,
			     p_cid_schema      VARCHAR2 DEFAULT NULL,
			     p_type	       NUMBER DEFAULT 1)
      RETURN VARCHAR2;

   FUNCTION get_trns_lbl (p_cntry_2_ltr     VARCHAR2 DEFAULT NULL,
			  p_lang_code	    VARCHAR2 DEFAULT NULL,
			  p_lang_id	    NUMBER DEFAULT 0,
			  p_CID_NAME_LBL    VARCHAR2)
      RETURN VARCHAR2;


   PROCEDURE crt_CST_new_addr_rcrd (p_addr_type      NUMBER DEFAULT 1,
				    p_cst_br_code    VARCHAR2,
				    p_cntry_2_ltr    VARCHAR2);

   PROCEDURE crt_BR_new_addr_rcrd (p_addr_type	    NUMBER DEFAULT 1,
				   p_cst_br_code    VARCHAR2,
				   p_cntry_2_ltr    VARCHAR2);

   FUNCTION get_addr_SYS_CLMN_val (p_addr_cat	    NUMBER,
				   p_addr_type	    NUMBER DEFAULT 1,
				   P_cst_br_code    VARCHAR2,
				   P_Cid_clmn_nm    VARCHAR2)
      RETURN VARCHAR2;

   FUNCTION GET_ADDR_RTRN_CLMN_VAL (p_addr_cat	     NUMBER,
				    p_addr_type      NUMBER DEFAULT 1,
				    P_cst_br_code    VARCHAR2,
				    P_Cid_clmn_nm    VARCHAR2,
				    p_lang_id	     NUMBER)
      RETURN VARCHAR2;

   PROCEDURE set_gnr_para (P_BRN_NO	     NUMBER,
			   P_LANG_NO	     NUMBER,
			   p_addr_cat	     NUMBER DEFAULT 1,
			   p_addr_typ	     NUMBER DEFAULT 1,
			   p_cst_br_code     VARCHAR2 DEFAULT '0',
			   p_addr_rcrd_sq    NUMBER DEFAULT 0);

   FUNCTION get_usr_addr_rcrd_sq
      RETURN NUMBER;

   FUNCTION get_usr_addr_typ
      RETURN NUMBER;

   FUNCTION get_usr_addr_cat
      RETURN NUMBER;

   FUNCTION get_usr_addr_cst_br_code
      RETURN VARCHAR2;

   FUNCTION GET_usr_cntry_2_ltr_code
      RETURN VARCHAR2;

   FUNCTION GET_usr_LANG_NO
      RETURN NUMBER;

   FUNCTION GET_USR_LANG_CODE
      RETURN VARCHAR2;



   PROCEDURE mrg_addr_rcrd (
      p_row_id		 ROWID,
      p_SYS_CLMN_VAL	 ADDR_LST_DTL.SYS_CLMN_VAL%TYPE,
      p_CLMN_VAL	 ADDR_LST_DTL.CLMN_VAL%TYPE,
      p_CLMN_VAL_F	 ADDR_LST_DTL.CLMN_VAL_F%TYPE,
      p_RTRN_CLMN_VAL	 ADDR_LST_DTL.RTRN_CLMN_VAL%TYPE,
      p_lst_RCRD_SQ	 ADDR_LST_DTL.RCRD_SQ%TYPE);

   PROCEDURE mrg_CID_rcrd (p_row_id	    ROWID,
			   p_CLMN_VAL	    INPT_CID_lst_dtl.CLMN_VAL%TYPE,
			   p_lst_RCRD_SQ    INPT_CID_lst_dtl.RCRD_SQ%TYPE);

   PROCEDURE Crt_cst_new_CID_rcrd (P_cst_br_code    VARCHAR2,
				   P_cntry_2_ltr    VARCHAR2);


 PROCEDURE Tst_addr_cid_inpt_fld (P_inpt_cat	      NUMBER,
				    P_cid_clmn_nm	VARCHAR2,
				    P_clmn_val		VARCHAR2,
				    P_TAX_CLC_TYP	NUMBER,
				    P_invld_inpt    OUT NUMBER,
				    P_err_msg	    OUT VARCHAR2);
   FUNCTION phn_nmbr_vldtn (p_phone_nm VARCHAR2)
      RETURN NUMBER;

   PROCEDURE Tst_addr_cid_aftr_sav (P_inpt_cat		NUMBER,
				    P_addr_typ		NUMBER,
				    P_TAX_CLC_TYP	NUMBER,
				    P_cst_br_code	VARCHAR2,
				    P_invld_inpt    OUT NUMBER,
				    P_err_msg	    OUT VARCHAR2);

   FUNCTION get_cst_br_cntry_code (P_addr_cat	    NUMBER,
				   P_addr_typ	    NUMBER,
				   P_cst_br_code    VARCHAR2)
      RETURN VARCHAR2;

   FUNCTION Get_cst_br_addr_fld_val (P_addr_cat       NUMBER,
				     P_addr_typ       NUMBER,
				     P_cst_br_code    VARCHAR2,
				     p_cid_clmn_nm    VARCHAR2,
				     p_clmn_typ       NUMBER)
      RETURN VARCHAR2;

   PROCEDURE Tst_addr_sys_fld (P_addr_cat	   NUMBER,
			       P_addr_typ	   NUMBER,
			       P_cid_clmn_nm	   VARCHAR2,
			       P_clmn_val	   VARCHAR2,
			       P_cst_br_code	   VARCHAR2,
			       P_invld_inpt    OUT NUMBER,
			       P_err_msg       OUT VARCHAR2);

   FUNCTION Get_cst_br_addr_full_str (P_addr_cat       NUMBER,
				      P_addr_typ       NUMBER,
				      P_cst_br_code    VARCHAR2,
				      P_typ	   NUMBER DEFAULT 0 )
      RETURN VARCHAR2;

   FUNCTION Get_cst_br_cid_fld_val (P_cid_cat	     NUMBER,
				    P_cst_br_code    VARCHAR2,
				    p_cid_clmn_nm    VARCHAR2)
      RETURN VARCHAR2;

   FUNCTION Get_cst_br_cid_full_str (P_cid_cat	      NUMBER,
				     P_cst_br_code    VARCHAR2,
				     P_typ	  NUMBER DEFAULT 0 )
      RETURN VARCHAR2;
       PROCEDURE Crt_BR_new_CID_rcrd (P_cst_br_code    VARCHAR2,
				   P_cntry_2_ltr    VARCHAR2);
 FUNCTION tst_cst_br_cid_fld_sts (p_cntry_2_ltr_code	  VARCHAR2,
				    P_inpt_cat		    NUMBER,
				    P_TAX_CLC_TYP	    NUMBER,
				    p_invc_trns_code	    NUMBER,
				    P_VAT_EXMPT_RSN_CODE    VARCHAR2,
				    p_cid_clmn_nm	    VARCHAR2)
      RETURN NUMBER;
 FUNCTION GET_cst_br_cid_fld_VAL ( P_inpt_cat		   NUMBER,
				    P_ADDR_TYP		    NUMBER,
				    P_TAX_CLC_TYP	    NUMBER,
				    p_invc_trns_code	    NUMBER,
				    P_VAT_EXMPT_RSN_CODE    VARCHAR2,
				    p_cid_clmn_nm	    VARCHAR2,
				    P_CST_BR_CODE	    VARCHAR2,
				    p_rcrd_sq number default 1)
      RETURN VARCHAR2;
PROCEDURE Tst_addr_cid_INVC_aftr_sav (P_inpt_cat		 NUMBER,
				 P_addr_typ		    NUMBER,
				 P_TAX_CLC_TYP		    NUMBER,
				 p_invc_trns_code	    NUMBER,
				 P_VAT_EXMPT_RSN_CODE	    VARCHAR2,
				 P_cst_br_code		    VARCHAR2,
				 P_invld_inpt		OUT NUMBER,
				 P_err_msg		OUT VARCHAR2);
FUNCTION GET_cst_br_ONE_cid_VAL (P_inpt_cat		 NUMBER,
				    P_TAX_CLC_TYP	    NUMBER,
				    p_invc_trns_code	    NUMBER,
				    P_VAT_EXMPT_RSN_CODE    VARCHAR2,
				    p_cid_CODE		    VARCHAR2,
				    P_CST_BR_CODE	    VARCHAR2,
				    p_rcrd_sq		    NUMBER DEFAULT 1)RETURN VARCHAR2;
PROCEDURE Crt_RemOwnr_new_addr_rcrd (P_addr_type      NUMBER DEFAULT 1,
				    P_cst_br_code    VARCHAR2,
				    P_cntry_2_ltr    VARCHAR2);

PROCEDURE Crt_RemOwnr_new_CID_rcrd (P_cst_br_code    VARCHAR2,
				      P_cntry_2_ltr    VARCHAR2) ;

PROCEDURE Crt_Vnd_new_CID_rcrd (P_cst_br_code	 VARCHAR2,
				   P_cntry_2_ltr    VARCHAR2) ;

PROCEDURE crt_VNDR_new_addr_rcrd (p_addr_type	   NUMBER DEFAULT 2,
					p_cst_br_code	 VARCHAR2,
					p_cntry_2_ltr	 VARCHAR2);
END cid_addr_op_pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: CID_ADDR_OP_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY Cid_addr_op_pkg
AS
   FUNCTION Get_cid_col_lbl (P_cntry_2_ltr     VARCHAR2 DEFAULT NULL,
			     P_lang_code       VARCHAR2 DEFAULT NULL,
			     P_lang_id	       NUMBER DEFAULT 1,
			     P_colmn_name      VARCHAR2 DEFAULT NULL,
			     P_cid_code        VARCHAR2 DEFAULT NULL,
			     P_cid_sub_code    NUMBER DEFAULT NULL,
			     P_cid_schema      VARCHAR2 DEFAULT NULL,
			     P_type	       NUMBER DEFAULT 1)
      RETURN VARCHAR2
   IS
      Whr	       VARCHAR2 (2000) := '';
      Sql_str	       VARCHAR2 (4000);
      V_lbl_txt        VARCHAR2 (500);
      V_cid_name_lbl   s_Cid_list_dtl.Cid_name_lbl%TYPE;
   BEGIN
      CASE
	 WHEN P_colmn_name IS NOT NULL
	 THEN
	    Whr :=
		  Whr
	       || ' and upper(CID_CLMN_NM)='
	       || CHR (39)
	       || UPPER (P_colmn_name)
	       || CHR (39);
	 WHEN P_cid_code IS NOT NULL
	 THEN
	    Whr :=
		  Whr
	       || ' and upper(CID_CODE)='
	       || CHR (39)
	       || UPPER (P_cid_code)
	       || CHR (39);
	 WHEN P_cid_sub_code IS NOT NULL
	 THEN
	    Whr := Whr || ' and cid_sub_code=' || P_cid_sub_code;
	 WHEN P_cid_schema IS NOT NULL AND P_cntry_2_ltr IS NOT NULL
	 THEN
	    Whr :=
		  Whr
	       || ' and upper(SCHEMA_ID)like''%('
	       || UPPER (P_cntry_2_ltr)
	       || '):'
	       || UPPER (P_cid_schema)
	       || '''%';
	 WHEN P_cid_schema IS NOT NULL AND P_cntry_2_ltr IS NULL
	 THEN
	    Whr :=
		  Whr
	       || ' and upper(SCHEMA_ID)='
	       || CHR (39)
	       || UPPER (P_cid_schema)
	       || CHR (39);
	 ELSE
	    Whr := NULL;
      END CASE;

      BEGIN
	 Sql_str := 'select CID_NAME_LBL from s_Cid_list_dtl
		    where 1=1 ' || Whr;

	 --return  Sql_str;
	 EXECUTE IMMEDIATE Sql_str INTO V_cid_name_lbl;

	 IF P_type = 1
	 THEN
	    RETURN V_cid_name_lbl;
	 END IF;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    RETURN NULL;
      END;

      V_lbl_txt :=
	 Get_trns_lbl (P_cntry_2_ltr	=> P_cntry_2_ltr,
		       P_lang_code	=> P_lang_code,
		       P_lang_id	=> P_lang_id,
		       P_cid_name_lbl	=> V_cid_name_lbl);

      RETURN V_lbl_txt;
   END Get_cid_col_lbl;

   FUNCTION Get_trns_lbl (P_cntry_2_ltr     VARCHAR2 DEFAULT NULL,
			  P_lang_code	    VARCHAR2 DEFAULT NULL,
			  P_lang_id	    NUMBER DEFAULT 0,
			  P_cid_name_lbl    VARCHAR2)
      RETURN VARCHAR2
   IS
      V_lbl_txt     VARCHAR2 (500);
      V_lang_code   VARCHAR2 (2);
      V_lang_id     NUMBER (2);
   BEGIN
      V_lang_id :=
	 CASE
	    WHEN NVL (P_lang_id, 0) > 0 THEN P_lang_id
	    ELSE GNR_E_INVC_OP.GET_LANG_DFLT
	 END;
      V_lang_code :=
	 NVL (P_lang_code,
	      GNR_E_INVC_OP.GET_LANG_ABRV (P_LANG_NO => V_lang_id));

      BEGIN
	 SELECT Lbl_txt
	   INTO V_lbl_txt
	   FROM (  SELECT Lang_tr, Lbl_txt
		     FROM s_Inpt_trns_lbl Lbl
		    WHERE     UPPER (Lbl.Lbl_code) = UPPER (P_cid_name_lbl)
			  AND Lang_id = V_lang_id
		 ORDER BY LENGTH (Lang_tr) DESC)
	  WHERE     (	UPPER (Lang_tr) = UPPER (V_lang_code)
		     OR UPPER (Lang_tr) =
			      UPPER (V_lang_code)
			   || '-'
			   || UPPER (P_cntry_2_ltr))
		AND ROWNUM <= 1;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    V_lbl_txt := NULL;
      END;

      RETURN V_lbl_txt;
   END Get_trns_lbl;


   PROCEDURE Crt_cst_new_addr_rcrd (P_addr_type      NUMBER DEFAULT 1,
				    P_cst_br_code    VARCHAR2,
				    P_cntry_2_ltr    VARCHAR2)
   AS
      Sql_str	VARCHAR2 (4000);
      Cnt	NUMBER := 0;
   BEGIN
      IF P_cst_br_code IS NULL
      THEN
  INSERT
INTO Addr_lst_dtl
(Addr_cat, Addr_typ, Cid_code,
   Cid_sub_code, Cid_clmn_nm, Cst_br_code,
   Addr_sts, Rcrd_sq, Sys_clmn_val,
   Clmn_val, Clmn_val_f, Rtrn_clmn_val)
SELECT Addr_cat,
	Addr_typ,
       Cid_code,
       Cid_sub_code,Cid_clmn_nm,Cst_br_code,  Addr_sts, Rcrd_sq,  Sys_clmn_val,
   Clmn_val, Clmn_val_f,Rtrn_clmn_val
FROM(
SELECT 2 Addr_cat,
       1 Addr_typ,
       UPPER(Cid_code)Cid_code,
       Cid_sub_code,
       UPPER(s_Cid_list_dtl.Cid_clmn_nm)Cid_clmn_nm,
       UPPER(C_code) Cst_br_code
  FROM s_Cid_list_dtl,s_Cid_list_dtl_actv, Customer
 WHERE	   UPPER (Clmn_nm)  IN( UPPER ('ADDR_LST'),UPPER('CNTCT_INFO'))
    AND UPPER(s_Cid_list_dtl.Cid_clmn_nm)=UPPER(s_Cid_list_dtl_ACTV.Cid_clmn_nm)
	      AND s_Cid_list_dtl_actv.Cntry_2_ltr_code=NVL( P_cntry_2_ltr,'A' )
	      AND s_Cid_list_dtl_actv.Cust_actv > 0
MINUS
SELECT Addr_cat,
       Addr_typ,
	UPPER(Cid_code)Cid_code,
       Cid_sub_code,
       UPPER(Cid_clmn_nm)Cid_clmn_nm,
       UPPER(Cst_br_code) Cst_br_code
  FROM Addr_lst_dtl
 WHERE Addr_cat = 2 AND Addr_typ = 1 )
 MODEL
 REFERENCE   Cst_cntry ON(
 SELECT C_code,C.Cntry_no Cntry_no,C.Cntry_2_ltr_code,NVL(C.Cntry_shrt,C.Cntry_a_name)Cntry_shrt,NVL(C.Cntry_shrt_f,C.Cntry_e_name)Cntry_shrt_f FROM Customer R, Cntry C
 WHERE R.Cntry_no=C.Cntry_no
 )DIMENSION BY(C_code)
 MEASURES( Cntry_no,Cntry_shrt,Cntry_shrt_f,Cntry_2_ltr_code)
 REFERENCE   Cst_prov ON(
 SELECT C_code,Mst.Prov_no ,NVL(Dtl.Prov_shrt,Dtl.Prov_a_name)Prov_shrt,NVL(Dtl.Prov_shrt_f,Dtl.Prov_e_name)Prov_shrt_f FROM Customer Mst, Ias_provinces Dtl
 WHERE Mst.Prov_no IS NOT NULL AND Mst.Cntry_no=NVL(Dtl.Cntry_no,Mst.Cntry_no)
 AND Mst.Prov_no=Dtl.Prov_no
 )DIMENSION BY(C_code)
 MEASURES( Prov_no,Prov_shrt,Prov_shrt_f)
 REFERENCE   Cst_city ON(
 SELECT C_code,Mst.City_no ,NVL(Dtl.City_shrt,Dtl.City_a_name)City_shrt,NVL(Dtl.City_shrt_f,Dtl.City_e_name)City_shrt_f FROM Customer Mst, Cities Dtl
 WHERE Mst.City_no IS NOT NULL AND Mst.Cntry_no=NVL(Dtl.Cntry_no,Mst.Cntry_no)
 AND Mst.Prov_no=NVL(Dtl.Prov_no,Mst.Prov_no)
 AND Mst. City_no=Dtl.City_no
 )DIMENSION BY(C_code)
 MEASURES( City_no,City_shrt,City_shrt_f)
 REFERENCE   Cst_rgn ON(
 SELECT C_code,Mst.R_code ,NVL(Dtl.Rgn_shrt,Dtl.R_a_name)Rgn_shrt,NVL(Dtl.Rgn_shrt_f,Dtl.R_e_name)Rgn_shrt_f FROM Customer Mst, Regions Dtl
 WHERE Mst.R_code IS NOT NULL AND Mst.Cntry_no=NVL(Dtl.Cntry_no,Mst.Cntry_no)
 AND Mst.Prov_no=NVL(Dtl.Prov_no,Mst.Prov_no)
 AND Mst. City_no=NVL(Dtl.City_no,Mst.City_no)
 AND Mst.R_code=Dtl.R_code
 )DIMENSION BY(C_code)
 MEASURES( R_code,Rgn_shrt,Rgn_shrt_f)
  REFERENCE   Cst_addr ON(
 SELECT C_code, SUBSTR(NVL(Street,C_address),1,50) Street,SUBSTR(Building_no,1,50)Building_no,C_box,C_box_code,SUBSTR(Gln_code,1,INSTR(Gln_code,','))Longitude
 ,SUBSTR(Gln_code,INSTR(Gln_code,',')) Latitude ,SUBSTR(C_A_NAME,1,50)C_A_NAME,SUBSTR(C_E_NAME ,1,50)C_E_NAME ,SUBSTR(C_PHONE,1,50)C_PHONE, SUBSTR(C_FAX,1,50)C_FAX,SUBSTR( C_PERSON,1,50)C_PERSON
 , SUBSTR(C_E_MAIL,1,50) C_E_MAIL, SUBSTR(C_WEB_SITE,1,50)C_WEB_SITE, SUBSTR(C_MOBILE,1,50) C_MOBILE FROM Customer
 )DIMENSION BY(C_code)
 MEASURES( Street,Building_no,C_box,C_box_code,Longitude,Latitude,C_A_NAME,C_E_NAME,C_PHONE,C_FAX,C_PERSON,C_E_MAIL,C_WEB_SITE,C_MOBILE)
 DIMENSION BY(Cid_clmn_nm,Cst_br_code)
 MEASURES( Addr_cat,
	Addr_typ,
       Cid_code,
       Cid_sub_code, 1 Addr_sts, 1 Rcrd_sq, CAST(NULL AS VARCHAR2(30)) Sys_clmn_val,
   CAST(NULL AS VARCHAR2(50))Clmn_val,CAST(NULL AS VARCHAR2(50)) Clmn_val_f,CAST(NULL AS VARCHAR2(20)) Rtrn_clmn_val)
   RULES(
	Sys_clmn_val['COUNTRY',ANY]=Cst_cntry.Cntry_no[CV(Cst_br_code)],
	Clmn_val['COUNTRY',ANY]=Cst_cntry.Cntry_shrt[CV(Cst_br_code)],
	Clmn_val_f['COUNTRY',ANY]=Cst_cntry.Cntry_shrt_f[CV(Cst_br_code)],
	Rtrn_clmn_val['COUNTRY',ANY]=Cst_cntry.Cntry_2_ltr_code[CV(Cst_br_code)],
	--------------REGION  PROV
	    Sys_clmn_val['REGION',ANY]=Cst_prov.Prov_no[CV(Cst_br_code)],
	Clmn_val['REGION',ANY]=Cst_prov.Prov_shrt[CV(Cst_br_code)],
	Clmn_val_f['REGION',ANY]=Cst_prov.Prov_shrt_f[CV(Cst_br_code)],
	------------SETTLEMENT CITIES
	    Sys_clmn_val['SETTLEMENT',ANY]=Cst_city.City_no[CV(Cst_br_code)],
	Clmn_val['SETTLEMENT',ANY]=Cst_city.City_shrt[CV(Cst_br_code)],
	Clmn_val_f['SETTLEMENT',ANY]=Cst_city.City_shrt_f[CV(Cst_br_code)],
	----------------------MUNICIPALITY REGIONS
	    Sys_clmn_val['MUNICIPALITY',ANY]=Cst_rgn.R_code[CV(Cst_br_code)],
	Clmn_val['MUNICIPALITY',ANY]=Cst_rgn.Rgn_shrt[CV(Cst_br_code)],
	Clmn_val_f['MUNICIPALITY',ANY]=Cst_rgn.Rgn_shrt_f[CV(Cst_br_code)],
	-------- STREETNAME  NVL(STREET,C_ADDRESS)
	Clmn_val['STREETNAME',ANY]=Cst_addr.Street[CV(Cst_br_code)],
	------- HOUSENUMBER BUILDING_NO
	 Clmn_val['HOUSENUMBER',ANY]=Cst_addr.Building_no[CV(Cst_br_code)],
	------POSTALCODE  C_BOX
	 Clmn_val['POSTALCODE',ANY]=Cst_addr.C_box[CV(Cst_br_code)],
	-------  POBOX C_BOX_CODE
	 Clmn_val['POBOX',ANY]=Cst_addr.C_box_code[CV(Cst_br_code)],
	---LONGITUDE . LATITUDE GLN_CODE
	 Clmn_val['LONGITUDE',ANY]=Cst_addr.Longitude[CV(Cst_br_code)],
	  Clmn_val['LATITUDE',ANY]=Cst_addr.Latitude[CV(Cst_br_code)],
	  ----- C_NAME,--COMR_NAME
	   Clmn_val['COMR_NAME',ANY]=Cst_addr.C_A_NAME[CV(Cst_br_code)],
	     Clmn_val_F['COMR_NAME',ANY]=Cst_addr.C_E_NAME[CV(Cst_br_code)],
	   ---- C_PHONE,--LND_PH_NO
	   Clmn_val['LND_PH_NO',ANY]=Cst_addr.C_PHONE[CV(Cst_br_code)],
	--C_FAX,      --LND_PH_NO1
	Clmn_val['LND_PH_NO1',ANY]=Cst_addr.C_FAX[CV(Cst_br_code)],
	---C_PERSON,--PRSN_NAME
	Clmn_val['PRSN_NAME',ANY]=Cst_addr.C_PERSON[CV(Cst_br_code)],
	--  C_E_MAIL, --EMAIL_ADDR
	Clmn_val['EMAIL_ADDR',ANY]=Cst_addr.C_E_MAIL[CV(Cst_br_code)],
	--C_WEB_SITE,  --WEB_ST_ADDR
	Clmn_val['WEB_ST_ADDR',ANY]=Cst_addr.C_WEB_SITE[CV(Cst_br_code)],
	-- C_MOBILE --MOB_PH_NO
	Clmn_val['MOB_PH_NO',ANY]=Cst_addr.C_MOBILE[CV(Cst_br_code)]
   );
      ELSE
	 INSERT INTO Addr_lst_dtl (Addr_cat,
				   Addr_typ,
				   Cid_code,
				   Cid_sub_code,
				   Cid_clmn_nm,
				   Cst_br_code,
				   Addr_sts,
				   Rcrd_sq)
	    SELECT Addr_cat,
		   Addr_typ,
		   Cid_code,
		   Cid_sub_code,
		   Cid_clmn_nm,
		   Cst_br_code,
		   1 Addr_sts,
		   1 Rcrd_sq
	      FROM (SELECT 2 Addr_cat,
			   NVL (P_addr_type, 1) Addr_typ,
			   UPPER (Cid_code) Cid_code,
			   Cid_sub_code,
			   UPPER (s_Cid_list_dtl.Cid_clmn_nm) Cid_clmn_nm,
			   UPPER (P_cst_br_code) Cst_br_code
		      FROM s_Cid_list_dtl, s_Cid_list_dtl_actv
		     WHERE     UPPER (Clmn_nm) IN (UPPER ('ADDR_LST'),
						   UPPER ('CNTCT_INFO'))
			   AND UPPER (s_Cid_list_dtl.Cid_clmn_nm) =
				  UPPER (s_Cid_list_dtl_ACTV.Cid_clmn_nm)
			   AND s_Cid_list_dtl_actv.Cntry_2_ltr_code =
				  NVL (P_cntry_2_ltr, 'A')
			   AND s_Cid_list_dtl_actv.Cust_actv > 0
		    MINUS
		    SELECT Addr_cat,
			   Addr_typ,
			   UPPER (Cid_code) Cid_code,
			   Cid_sub_code,
			   UPPER (Cid_clmn_nm) Cid_clmn_nm,
			   UPPER (Cst_br_code) Cst_br_code
		      FROM Addr_lst_dtl
		     WHERE     Addr_cat = 2
			   AND Addr_typ = NVL (P_addr_type, 1)
			   AND UPPER (Cst_br_code) = UPPER (P_cst_br_code));
      END IF;
   END Crt_cst_new_addr_rcrd;
   PROCEDURE Crt_br_new_addr_rcrd (P_addr_type	    NUMBER DEFAULT 1,
				   P_cst_br_code    VARCHAR2,
				   P_cntry_2_ltr    VARCHAR2)
   AS
   BEGIN
      IF P_cst_br_code IS NULL
      THEN
INSERT INTO Addr_lst_dtl
(Addr_cat, Addr_typ, Cid_code,
   Cid_sub_code, Cid_clmn_nm, Cst_br_code,
   Addr_sts, Rcrd_sq, Sys_clmn_val,
   Clmn_val, Clmn_val_f, Rtrn_clmn_val)
SELECT Addr_cat,
	Addr_typ,
       Cid_code,
       Cid_sub_code,Cid_clmn_nm,Cst_br_code,  Addr_sts, Rcrd_sq,  Sys_clmn_val,
   Clmn_val, Clmn_val_f,Rtrn_clmn_val
FROM(
SELECT 1 Addr_cat,
       1 Addr_typ,
       UPPER(Cid_code)Cid_code,
       Cid_sub_code,
       UPPER(s_Cid_list_dtl.Cid_clmn_nm)Cid_clmn_nm,
       UPPER(Brn_no) Cst_br_code
  FROM s_Cid_list_dtl,s_Cid_list_dtl_actv,S_BRN
 WHERE	   UPPER (Clmn_nm)  IN( UPPER ('ADDR_LST'),UPPER('CNTCT_INFO'))
    AND UPPER(s_Cid_list_dtl.Cid_clmn_nm)=UPPER(s_Cid_list_dtl_ACTV.Cid_clmn_nm)
	      AND s_Cid_list_dtl_actv.Cntry_2_ltr_code=NVL( P_cntry_2_ltr,'A' )
	      AND s_Cid_list_dtl_actv.Suplly_actv > 0

MINUS
SELECT Addr_cat,
       Addr_typ,
	UPPER(Cid_code)Cid_code,
       Cid_sub_code,
       UPPER(Cid_clmn_nm)Cid_clmn_nm,
       UPPER(Cst_br_code) Cst_br_code
  FROM Addr_lst_dtl
 WHERE Addr_cat = 1 AND Addr_typ = 1 )
 MODEL
 REFERENCE   Cst_cntry ON(
 SELECT TO_CHAR(Brn_no)Brn_no,C.Cntry_no Cntry_no,C.Cntry_2_ltr_code,NVL(C.Cntry_shrt,C.Cntry_a_name)Cntry_shrt,NVL(C.Cntry_shrt_f,C.Cntry_e_name)Cntry_shrt_f FROM S_brn R, Cntry C
 WHERE R.Cntry_no=C.Cntry_no
 )DIMENSION BY(Brn_no)
 MEASURES( Cntry_no,Cntry_shrt,Cntry_shrt_f,Cntry_2_ltr_code)
 REFERENCE   Cst_prov ON(
 SELECT TO_CHAR(Brn_no)Brn_no,Mst.Prov_no ,NVL(Dtl.Prov_shrt,Dtl.Prov_a_name)Prov_shrt,NVL(Dtl.Prov_shrt_f,Dtl.Prov_e_name)Prov_shrt_f FROM S_brn Mst, Ias_provinces Dtl
 WHERE Mst.Prov_no IS NOT NULL AND Mst.Cntry_no=NVL(Dtl.Cntry_no,Mst.Cntry_no)
 AND Mst.Prov_no=Dtl.Prov_no
 )DIMENSION BY(Brn_no)
 MEASURES( Prov_no,Prov_shrt,Prov_shrt_f)
 REFERENCE   Cst_city ON(
 SELECT TO_CHAR(Brn_no)Brn_no,Mst.City_no ,NVL(Dtl.City_shrt,Dtl.City_a_name)City_shrt,NVL(Dtl.City_shrt_f,Dtl.City_e_name)City_shrt_f FROM S_brn Mst, Cities Dtl
 WHERE Mst.City_no IS NOT NULL AND Mst.Cntry_no=NVL(Dtl.Cntry_no,Mst.Cntry_no)
 AND Mst.Prov_no=NVL(Dtl.Prov_no,Mst.Prov_no)
 AND Mst. City_no=Dtl.City_no
 )DIMENSION BY(Brn_no)
 MEASURES( City_no,City_shrt,City_shrt_f)
 REFERENCE   Cst_rgn ON(
 SELECT TO_CHAR(Brn_no)Brn_no,Mst.R_code ,NVL(Dtl.Rgn_shrt,Dtl.R_a_name)Rgn_shrt,NVL(Dtl.Rgn_shrt_f,Dtl.R_e_name)Rgn_shrt_f FROM S_brn Mst, Regions Dtl
 WHERE Mst.R_code IS NOT NULL AND Mst.Cntry_no=NVL(Dtl.Cntry_no,Mst.Cntry_no)
 AND Mst.Prov_no=NVL(Dtl.Prov_no,Mst.Prov_no)
 AND Mst. City_no=NVL(Dtl.City_no,Mst.City_no)
 AND Mst.R_code=Dtl.R_code
 )DIMENSION BY(Brn_no)
 MEASURES( R_code,Rgn_shrt,Rgn_shrt_f)
  REFERENCE   Cst_addr ON(
 SELECT TO_CHAR(Brn_no)Brn_no, SUBSTR(Street,1,50) Street,SUBSTR(Building_no,1,50)Building_no,Longitude
 , Latitude FROM S_brn
 )DIMENSION BY(Brn_no)
 MEASURES( Street,Building_no,Longitude,Latitude)
 DIMENSION BY(Cid_clmn_nm,Cst_br_code)
 MEASURES( Addr_cat,
	Addr_typ,
       Cid_code,
       Cid_sub_code, 1 Addr_sts, 1 Rcrd_sq, CAST(NULL AS VARCHAR2(30)) Sys_clmn_val,
   CAST(NULL AS VARCHAR2(50))Clmn_val,CAST(NULL AS VARCHAR2(50)) Clmn_val_f,CAST(NULL AS VARCHAR2(20)) Rtrn_clmn_val)
   RULES(
	Sys_clmn_val['COUNTRY',ANY]=Cst_cntry.Cntry_no[CV(Cst_br_code)],
	Clmn_val['COUNTRY',ANY]=Cst_cntry.Cntry_shrt[CV(Cst_br_code)],
	Clmn_val_f['COUNTRY',ANY]=Cst_cntry.Cntry_shrt_f[CV(Cst_br_code)],
	Rtrn_clmn_val['COUNTRY',ANY]=Cst_cntry.Cntry_2_ltr_code[CV(Cst_br_code)],
	--------------REGION  PROV
	    Sys_clmn_val['REGION',ANY]=Cst_prov.Prov_no[CV(Cst_br_code)],
	Clmn_val['REGION',ANY]=Cst_prov.Prov_shrt[CV(Cst_br_code)],
	Clmn_val_f['REGION',ANY]=Cst_prov.Prov_shrt_f[CV(Cst_br_code)],
	------------SETTLEMENT CITIES
	    Sys_clmn_val['SETTLEMENT',ANY]=Cst_city.City_no[CV(Cst_br_code)],
	Clmn_val['SETTLEMENT',ANY]=Cst_city.City_shrt[CV(Cst_br_code)],
	Clmn_val_f['SETTLEMENT',ANY]=Cst_city.City_shrt_f[CV(Cst_br_code)],
	----------------------MUNICIPALITY REGIONS
	    Sys_clmn_val['MUNICIPALITY',ANY]=Cst_rgn.R_code[CV(Cst_br_code)],
	Clmn_val['MUNICIPALITY',ANY]=Cst_rgn.Rgn_shrt[CV(Cst_br_code)],
	Clmn_val_f['MUNICIPALITY',ANY]=Cst_rgn.Rgn_shrt_f[CV(Cst_br_code)],
	-------- STREETNAME  NVL(STREET,C_ADDRESS)
	Clmn_val_f['STREETNAME',ANY]=Cst_addr.Street[CV(Cst_br_code)],
	------- HOUSENUMBER BUILDING_NO
	 Clmn_val_f['HOUSENUMBER',ANY]=Cst_addr.Building_no[CV(Cst_br_code)],
	---LONGITUDE . LATITUDE GLN_CODE
	 Clmn_val_f['LONGITUDE',ANY]=Cst_addr.Longitude[CV(Cst_br_code)],
	  Clmn_val_f['LATITUDE',ANY]=Cst_addr.Latitude[CV(Cst_br_code)]
   );
      ELSE
	 INSERT INTO Addr_lst_dtl (Addr_cat,
				   Addr_typ,
				   Cid_code,
				   Cid_sub_code,
				   Cid_clmn_nm,
				   Cst_br_code,
				   Addr_sts,
				   Rcrd_sq)
	    SELECT Addr_cat,
		   Addr_typ,
		   Cid_code,
		   Cid_sub_code,
		   Cid_clmn_nm,
		   Cst_br_code,
		   1 Addr_sts,
		   1 Rcrd_sq
	      FROM (SELECT 1 Addr_cat,
			   1 Addr_typ,
			   UPPER (Cid_code) Cid_code,
			   Cid_sub_code,
			   UPPER (s_Cid_list_dtl.Cid_clmn_nm) Cid_clmn_nm,
			   UPPER (P_cst_br_code) Cst_br_code
		      FROM s_Cid_list_dtl, s_Cid_list_dtl_actv
		     WHERE     UPPER (Clmn_nm) IN (UPPER ('ADDR_LST'),
						   UPPER ('CNTCT_INFO'))
			   AND UPPER (s_Cid_list_dtl.Cid_clmn_nm) =
				  UPPER (s_Cid_list_dtl_ACTV.Cid_clmn_nm)
			   AND s_Cid_list_dtl_actv.Cntry_2_ltr_code =
				  NVL (P_cntry_2_ltr, 'A')
			   AND s_Cid_list_dtl_actv.Suplly_actv > 0
		    MINUS
		    SELECT Addr_cat,
			   Addr_typ,
			   UPPER (Cid_code) Cid_code,
			   Cid_sub_code,
			   UPPER (Cid_clmn_nm) Cid_clmn_nm,
			   UPPER (Cst_br_code) Cst_br_code
		      FROM Addr_lst_dtl
		     WHERE     Addr_cat = 1
			   AND Addr_typ = NVL (P_addr_type, 1)
			   AND Cst_br_code = P_cst_br_code);
      END IF;
   END Crt_br_new_addr_rcrd;

   FUNCTION get_addr_SYS_CLMN_val (p_addr_cat	    NUMBER,
				   p_addr_type	    NUMBER DEFAULT 1,
				   P_cst_br_code    VARCHAR2,
				   P_Cid_clmn_nm    VARCHAR2)
      RETURN VARCHAR2
   IS
      V_SYS_CLMN_VAL   VARCHAR2 (30);
   BEGIN
      IF P_cst_br_code IS NOT NULL
      THEN
	 BEGIN
	    SELECT SYS_CLMN_VAL
	      INTO V_SYS_CLMN_VAL
	      FROM Addr_lst_dtl
	     WHERE     Addr_cat = NVL (p_addr_cat, 1)
		   AND Addr_typ = NVL (P_addr_type, 1)
		   AND UPPER (Cid_code) = UPPER ('AD')
		   AND Cst_br_code = P_cst_br_code
		   AND UPPER (Cid_clmn_nm) = UPPER (P_Cid_clmn_nm)
		   AND ROWNUM <= 1;
	 EXCEPTION
	    WHEN OTHERS
	    THEN
	       V_SYS_CLMN_VAL := NULL;
	 END;
      END IF;

      RETURN (V_SYS_CLMN_VAL);
   END get_addr_SYS_CLMN_val;

   FUNCTION GET_ADDR_RTRN_CLMN_VAL (p_addr_cat	     NUMBER,
				    p_addr_type      NUMBER DEFAULT 1,
				    P_cst_br_code    VARCHAR2,
				    P_Cid_clmn_nm    VARCHAR2,
				    p_lang_id	     NUMBER)
      RETURN VARCHAR2
   IS
      V_RTRN_CLMN_VAL	VARCHAR2 (30);
   BEGIN
      IF P_cst_br_code IS NOT NULL
      THEN
	 BEGIN
	    SELECT NVL (
		      RTRN_CLMN_VAL,
		      DECODE (NVL (GNR_E_INVC_OP.Get_Lang_DFLT, p_lang_id),
			      p_lang_id, NVL (CLMN_VAL, CLMN_VAL_F),
			      NVL (CLMN_VAL_F, CLMN_VAL)))
	      INTO V_RTRN_CLMN_VAL
	      FROM Addr_lst_dtl
	     WHERE     Addr_cat = NVL (p_addr_cat, 1)
		   AND Addr_typ = NVL (P_addr_type, 1)
		   AND UPPER (Cid_code) = UPPER ('AD')
		   AND Cst_br_code = P_cst_br_code
		   AND UPPER (Cid_clmn_nm) = UPPER (P_Cid_clmn_nm)
		   AND ROWNUM <= 1;
	 EXCEPTION
	    WHEN OTHERS
	    THEN
	       V_RTRN_CLMN_VAL := NULL;
	 END;
      END IF;

      RETURN (V_RTRN_CLMN_VAL);
   END GET_ADDR_RTRN_CLMN_VAL;

   PROCEDURE set_gnr_para (P_BRN_NO	     NUMBER,
			   P_LANG_NO	     NUMBER,
			   p_addr_cat	     NUMBER DEFAULT 1,
			   p_addr_typ	     NUMBER DEFAULT 1,
			   p_cst_br_code     VARCHAR2 DEFAULT '0',
			   p_addr_rcrd_sq    NUMBER DEFAULT 0)
   AS
   BEGIN
      usr_addr_cat := NVL (p_addr_cat, 1);
      usr_addr_typ := NVL (p_addr_typ, 1);
      usr_addr_cst_br_code :=
	 CASE
	    WHEN NVL (p_cst_br_code, '0') = '0' THEN NULL
	    ELSE p_cst_br_code
	 END;

    IF NVL (p_addr_rcrd_sq, 0) = 0
      THEN
      IF NVL( p_addr_typ ,0)<> 0 THEN
	 SELECT NVL (MAX (rcrd_sq), 1)
	   INTO usr_addr_rcrd_sq
	   FROM addr_lst_dtl
	  WHERE     addr_cat = usr_addr_cat
		AND addr_typ = usr_addr_typ
		AND cst_br_code = NVL (usr_addr_cst_br_code, cst_br_code);
      ELSE
       SELECT NVL (MAX (rcrd_sq), 1)
	   INTO usr_addr_rcrd_sq
	   FROM INPT_CID_LST_DTL
	  WHERE CID_cat = usr_addr_caT
	    AND cst_br_code = NVL (usr_addr_cst_br_code, cst_br_code);
       END IF;
      ELSE
	 usr_addr_rcrd_sq := p_addr_rcrd_sq;
      END IF;

      IF NVL (P_LANG_NO, 0) = 0
      THEN
	 usr_LANG_NO := GNR_E_INVC_OP.GET_LANG_DFLT;
      ELSE
	 usr_LANG_NO := P_LANG_NO;
      END IF;

      IF NVL (P_BRN_NO, 0) = 0
      THEN
	 usr_cntry_2_ltr_code := 'A';
      ELSE
	 usr_cntry_2_ltr_code :=
	    GNR_E_INVC_OP.GET_CNTRY_CODE_BY_CMP (
	       IAS_BRN_PKG.GET_BRN_MAIN_CMP (P_BRN_NO));
      END IF;

      USR_LANG_CODE := GNR_E_INVC_OP.GET_LANG_ABRV (P_LANG_NO => usr_LANG_NO);
   END set_gnr_para;

   FUNCTION GET_usr_cntry_2_ltr_code
      RETURN VARCHAR2
   IS
   BEGIN
      RETURN NVL (usr_cntry_2_ltr_code, 'A');
   END GET_usr_cntry_2_ltr_code;

   FUNCTION GET_usr_LANG_NO
      RETURN NUMBER
   IS
   BEGIN
      RETURN NVL (usr_LANG_NO, GNR_E_INVC_OP.GET_LANG_DFLT);
   END GET_usr_LANG_NO;

   FUNCTION GET_USR_LANG_CODE
      RETURN VARCHAR2
   IS
   BEGIN
      RETURN NVL (
		USR_LANG_CODE,
		GNR_E_INVC_OP.GET_LANG_ABRV (
		   P_LANG_NO   => GNR_E_INVC_OP.GET_LANG_DFLT));
   END GET_USR_LANG_CODE;

   FUNCTION get_usr_addr_rcrd_sq
      RETURN NUMBER
   IS
   BEGIN
      RETURN usr_addr_rcrd_sq;
   END get_usr_addr_rcrd_sq;

   FUNCTION get_usr_addr_typ
      RETURN NUMBER
   IS
   BEGIN
      RETURN NVL (usr_addr_typ, 1);
   END get_usr_addr_typ;

   FUNCTION get_usr_addr_cat
      RETURN NUMBER
   IS
   BEGIN
      RETURN NVL (usr_addr_cat, 1);
   END get_usr_addr_cat;

   FUNCTION get_usr_addr_cst_br_code
      RETURN VARCHAR2
   IS
   BEGIN
      RETURN usr_addr_cst_br_code;
   END get_usr_addr_cst_br_code;

   PROCEDURE mrg_addr_rcrd (
      p_row_id		 ROWID,
      p_SYS_CLMN_VAL	 ADDR_LST_DTL.SYS_CLMN_VAL%TYPE,
      p_CLMN_VAL	 ADDR_LST_DTL.CLMN_VAL%TYPE,
      p_CLMN_VAL_F	 ADDR_LST_DTL.CLMN_VAL_F%TYPE,
      p_RTRN_CLMN_VAL	 ADDR_LST_DTL.RTRN_CLMN_VAL%TYPE,
      p_lst_RCRD_SQ	 ADDR_LST_DTL.RCRD_SQ%TYPE)
   AS
      v_cnt   NUMBER (3) := 0;
   BEGIN
      BEGIN
	 SELECT 1
	   INTO v_cnt
	   FROM ADDR_LST_DTL
	  WHERE ROWID = p_row_id;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    v_cnt := 0;
      END;

      IF     v_cnt > 0
	 AND (	 p_CLMN_VAL IS NOT NULL
	      OR p_SYS_CLMN_VAL IS NOT NULL
	      OR p_CLMN_VAL_f IS NOT NULL)
      THEN
	 BEGIN
	    SELECT 1
	      INTO v_cnt
	      FROM ADDR_LST_DTL
	     WHERE     ROWID = p_row_id
		   AND SYS_CLMN_VAL IS NULL
		   AND CLMN_VAL IS NULL
		   AND CLMN_VAL_f IS NULL;
	 EXCEPTION
	    WHEN OTHERS
	    THEN
	       v_cnt := 0;
	 END;

	 IF v_cnt > 0
	 THEN
	    UPDATE ADDR_LST_DTL
	       SET SYS_CLMN_VAL = p_SYS_CLMN_VAL,
		   CLMN_VAL = p_CLMN_VAL,
		   CLMN_VAL_f = p_CLMN_VAL_f,
		   RTRN_CLMN_VAL = p_RTRN_CLMN_VAL
	     WHERE ROWID = p_row_id;
	 ELSE
	    BEGIN
	       SELECT 1
		 INTO v_cnt
		 FROM ADDR_LST_DTL
		WHERE	  ROWID = p_row_id
		      AND NVL (SYS_CLMN_VAL, '0') = NVL (p_SYS_CLMN_VAL, '0')
		      AND NVL (CLMN_VAL, '0') = NVL (p_CLMN_VAL, '0')
		      AND NVL (CLMN_VAL_f, '0') = NVL (p_CLMN_VAL_f, '0')
		      AND NVL (RTRN_CLMN_VAL, '0') =
			     NVL (p_RTRN_CLMN_VAL, '0');
	    EXCEPTION
	       WHEN OTHERS
	       THEN
		  v_cnt := 0;
	    END;

	    IF v_cnt = 0
	    THEN
	       INSERT INTO ADDR_LST_DTL (ADDR_CAT,
					 ADDR_TYP,
					 CID_CODE,
					 CID_SUB_CODE,
					 CID_CLMN_NM,
					 CST_BR_CODE,
					 aDDR_STS,
					 RCRD_SQ,
					 SYS_CLMN_VAL,
					 CLMN_VAL,
					 CLMN_VAL_F,
					 RTRN_CLMN_VAL)
		  SELECT ADDR_CAT,
			 ADDR_TYP,
			 CID_CODE,
			 CID_SUB_CODE,
			 CID_CLMN_NM,
			 CST_BR_CODE,
			 ADDR_STS,
			 NVL (p_lst_rcrd_sq, 1) + 1,
			 p_SYS_CLMN_VAL,
			 p_CLMN_VAL,
			 p_CLMN_VAL_f,
			 p_RTRN_CLMN_VAL
		    FROM ADDR_LST_DTL
		   WHERE ROWID = p_row_id;
	    END IF;
	 END IF;
      END IF;
   END mrg_addr_rcrd;

   PROCEDURE mrg_CID_rcrd (p_row_id	    ROWID,
			   p_CLMN_VAL	    INPT_CID_lst_dtl.CLMN_VAL%TYPE,
			   p_lst_RCRD_SQ    INPT_CID_lst_dtl.RCRD_SQ%TYPE)
   AS
      v_cnt   NUMBER (3) := 0;
   BEGIN
      BEGIN
	 SELECT 1
	   INTO v_cnt
	   FROM INPT_CID_lst_dtl
	  WHERE ROWID = p_row_id;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    v_cnt := 0;
      END;

      IF v_cnt > 0 AND p_CLMN_VAL IS NOT NULL
      THEN
	 BEGIN
	    SELECT 1
	      INTO v_cnt
	      FROM INPT_CID_lst_dtl
	     WHERE ROWID = p_row_id AND CLMN_VAL IS NULL;
	 EXCEPTION
	    WHEN OTHERS
	    THEN
	       v_cnt := 0;
	 END;

	 IF v_cnt > 0
	 THEN
	    UPDATE INPT_CID_lst_dtl
	       SET CLMN_VAL = p_CLMN_VAL
	     WHERE ROWID = p_row_id;
	 ELSE
	    BEGIN
	       SELECT 1
		 INTO v_cnt
		 FROM INPT_CID_lst_dtl
		WHERE	  ROWID = p_row_id
		      AND NVL (CLMN_VAL, '0') = NVL (p_CLMN_VAL, '0');
	    EXCEPTION
	       WHEN OTHERS
	       THEN
		  v_cnt := 0;
	    END;

	    IF v_cnt = 0
	    THEN
	       INSERT INTO INPT_CID_lst_dtl (CID_CAT,
					     CID_CODE,
					     CID_SUB_CODE,
					     CID_CLMN_NM,
					     CST_BR_CODE,
					     CID_STS,
					     RCRD_SQ,
					     CLMN_VAL)
		  SELECT CID_CAT,
			 CID_CODE,
			 CID_SUB_CODE,
			 CID_CLMN_NM,
			 CST_BR_CODE,
			 CID_STS,
		       RCRD_SQ + 1,
			 p_CLMN_VAL
		    FROM INPT_CID_lst_dtl
		   WHERE ROWID = p_row_id;
	    END IF;
	 END IF;
      END IF;
   END mrg_CID_rcrd;

   PROCEDURE Crt_cst_new_CID_rcrd (P_cst_br_code    VARCHAR2,
				   P_cntry_2_ltr    VARCHAR2)
   AS
   BEGIN
      IF P_cst_br_code IS NULL
      THEN
  INSERT
INTO INPT_CID_lst_dtl
(CID_cat, Cid_code,
   Cid_sub_code, Cid_clmn_nm, Cst_br_code,
   CID_STS, Rcrd_sq, Clmn_val)
SELECT CID_cat,
       Cid_code,
       Cid_sub_code,Cid_clmn_nm,Cst_br_code,  CID_STS, Rcrd_sq,Clmn_val
FROM(
SELECT 2 CID_CAT,
       UPPER(Cid_code)Cid_code,
       Cid_sub_code,
       UPPER(s_Cid_list_dtl.Cid_clmn_nm)Cid_clmn_nm,
       UPPER(C_code) Cst_br_code
      FROM s_Cid_list_dtl,s_Cid_list_dtl_actv, Customer
	WHERE	  UPPER (Clmn_nm) = UPPER ('OTH_ICD_LST')
	AND UPPER(s_Cid_list_dtl.Cid_clmn_nm)=UPPER(s_Cid_list_dtl_ACTV.Cid_clmn_nm)
		  AND s_Cid_list_dtl_actv.Cntry_2_ltr_code=NVL( P_cntry_2_ltr,'A' )
		  AND s_Cid_list_dtl_actv.Cust_actv > 0

MINUS
SELECT CID_cat,
	UPPER(Cid_code)Cid_code,
       Cid_sub_code,
       UPPER(Cid_clmn_nm)Cid_clmn_nm,
       UPPER(Cst_br_code) Cst_br_code
  FROM INPT_CID_lst_dtl
 WHERE CID_cat = 2 )
 MODEL
   REFERENCE   Cst_addr ON(
 SELECT C_code, C_TAX_CODE,CR_NO CRN_NO,NIS_NO,NAI_DSC,EQ_CPTL,CST_GCC FROM Customer
 )DIMENSION BY(C_code)
 MEASURES( C_TAX_CODE,CRN_NO,NIS_NO,NAI_DSC,EQ_CPTL,CST_GCC)
 DIMENSION BY(Cid_clmn_nm,Cst_br_code)
 MEASURES( CID_cat,Cid_code,  Cid_sub_code, 1 CID_STS, 1 Rcrd_sq,   CAST(NULL AS VARCHAR2(50))Clmn_val)
   RULES(
	-- C_TAX_CODE --VAT_NO
	Clmn_val['VAT_NO',ANY]=Cst_addr.C_TAX_CODE[CV(Cst_br_code)],
	--CRN_NO   CRN_NO
	Clmn_val['CRN_NO',ANY]=Cst_addr.CRN_NO[CV(Cst_br_code)],
	--NAI_DSC TAX_SUB_CODE
	Clmn_val['TAX_SUB_CODE',ANY]=Cst_addr.NAI_DSC[CV(Cst_br_code)],
	--CST_GCC  GCC_NO
	Clmn_val['GCC_NO',ANY]=Cst_addr.CST_GCC[CV(Cst_br_code)],
	 --EQ_CPTL  CAPITAL
	Clmn_val['CAPITAL',ANY]=Cst_addr.EQ_CPTL[CV(Cst_br_code)],
	 --NIS_NO  NIS_CODE
	Clmn_val['NIS_CODE',ANY]=Cst_addr.NIS_NO[CV(Cst_br_code)]
   );
      ELSE
	 INSERT INTO INPT_CID_lst_dtl (CID_cat,
				       Cid_code,
				       Cid_sub_code,
				       Cid_clmn_nm,
				       Cst_br_code,
				       CID_STS,
				       Rcrd_sq)
	    SELECT CID_cat,
		   Cid_code,
		   Cid_sub_code,
		   Cid_clmn_nm,
		   Cst_br_code,
		   1 CID_STS,
		   1 Rcrd_sq
	      FROM (SELECT 2 CID_CAT,
			   UPPER (Cid_code) Cid_code,
			   Cid_sub_code,
			   UPPER (s_Cid_list_dtl.Cid_clmn_nm) Cid_clmn_nm,
			   UPPER (P_cst_br_code) Cst_br_code
		      FROM s_Cid_list_dtl, s_Cid_list_dtl_actv
		     WHERE     UPPER (Clmn_nm) = UPPER ('OTH_ICD_LST')
			   AND UPPER (s_Cid_list_dtl.Cid_clmn_nm) =
				  UPPER (s_Cid_list_dtl_ACTV.Cid_clmn_nm)
			   AND s_Cid_list_dtl_actv.Cntry_2_ltr_code =
				  NVL (P_cntry_2_ltr, 'A')
			   AND s_Cid_list_dtl_actv.Cust_actv > 0
		    MINUS
		    SELECT CID_cat,
			   UPPER (Cid_code) Cid_code,
			   Cid_sub_code,
			   UPPER (Cid_clmn_nm) Cid_clmn_nm,
			   UPPER (Cst_br_code) Cst_br_code
		      FROM INPT_CID_lst_dtl
		     WHERE     CID_cat = 2
			   AND UPPER (Cst_br_code) = UPPER (P_cst_br_code));
      END IF;
   END Crt_cst_new_CID_rcrd;


   FUNCTION Phn_nmbr_vldtn (P_phone_nm VARCHAR2)
      RETURN NUMBER
   IS
      V_reg_exp 	   VARCHAR2 (200);
      V_lngth_cntry_code   NUMBER;
      V_lngth_phone_code   NUMBER;
      V_phn_flg 	   NUMBER (1);
   BEGIN
      V_phn_flg := 0;

      IF REGEXP_COUNT (P_phone_nm, '\d') BETWEEN 6 AND 17
      THEN
	 IF REGEXP_LIKE (P_phone_nm, '\A[(]')
	 THEN
	    IF REGEXP_LIKE (
		  P_phone_nm,
		  '^([(]([\+]|[0]{2})[1-9]{1,3}[)]([[:space:]]|[\.])?)(([0]{1})[1-9]{1,2}([[:space:]]|[\.])?)?[1-9]{1}[0-9]{5,9}$')
	    THEN
	       V_phn_flg := 1;
	    ELSE
	       V_phn_flg := 0;
	    END IF;
	 ELSIF REGEXP_LIKE (P_phone_nm, '\A([\+]|[0]{2})')
	 THEN
	    IF REGEXP_LIKE (
		  P_phone_nm,
		  '^(([\+]|[0]{2})[1-9]{1,3}([[:space:]]|[\.])?)(([0]{1})[1-9]{1,2}([[:space:]]|[\.])?)?[1-9]{1}[0-9]{5,9}$')
	    THEN
	       V_phn_flg := 1;
	    ELSE
	       V_phn_flg := 0;
	    END IF;
	 ELSIF REGEXP_LIKE (P_phone_nm, '\A([0]{1})')
	 THEN
	    IF REGEXP_LIKE (
		  P_phone_nm,
		  '^(([0]{1}[1-9]{1,2}(([[:space:]]|[\.])[1-9]{1})?))[0-9]{5,8}$')
	    THEN
	       V_phn_flg := 1;
	    ELSE
	       V_phn_flg := 0;
	    END IF;
	 ELSE
	    IF REGEXP_LIKE (P_phone_nm, '^[0-9]{6,9}$')
	    THEN
	       V_phn_flg := 1;
	    ELSE
	       V_phn_flg := 0;
	    END IF;
	 END IF;
      END IF;

      RETURN V_phn_flg;
   END Phn_nmbr_vldtn;

   PROCEDURE Tst_addr_cid_inpt_fld (P_inpt_cat		NUMBER,
				    P_cid_clmn_nm	VARCHAR2,
				    P_clmn_val		VARCHAR2,
				    P_TAX_CLC_TYP	NUMBER,
				    P_invld_inpt    OUT NUMBER,
				    P_err_msg	    OUT VARCHAR2)
   AS
      V_vld_func	   VARCHAR2 (100);
      V_vld_func_val	   NUMBER (1);
      V_cntry_2_ltr_code   VARCHAR2 (2);
      V_CNT		   NUMBER (5);
      V_TAX_CLC_TYP	   NUMBER (2);
   BEGIN
      IF NVL (P_TAX_CLC_TYP, 0) = 0
      THEN
	 V_TAX_CLC_TYP := 10;
      ELSE
	 BEGIN
	    SELECT CLC_TAX_TYP
	      INTO V_TAX_CLC_TYP
	      FROM GNR_TAX_TYP_CLC_MST
	     WHERE CLC_TYP_NO = P_TAX_CLC_TYP AND ROWNUM = 1;
	 EXCEPTION
	    WHEN OTHERS
	    THEN
	       V_TAX_CLC_TYP := 10;
	 END;
      END IF;

      V_cntry_2_ltr_code :=
	 NVL (
	    Get_cst_br_cntry_code (P_addr_cat	   => Usr_addr_cat,
				   P_addr_typ	   => Usr_addr_typ,
				   P_cst_br_code   => Usr_addr_cst_br_code),
	    Usr_cntry_2_ltr_code);

      IF P_clmn_val IS NULL
      THEN
	 BEGIN
	    SELECT 1
	      INTO V_CNT
	      FROM S_CID_LIST_INPT_ACTV ACTV,
		   (SELECT CID_CODE, D.CID_CLMN_NM, CID_SUB_CODE
		      FROM S_Cid_list_dtl M, S_Cid_list_dtl_actv D
		     WHERE     UPPER (D.cid_clmn_nm) = UPPER (P_cid_clmn_nm)
			   AND UPPER (M.CID_CLMN_NM) = UPPER (D.CID_CLMN_NM)
			   AND UPPER (D.CNTRY_2_LTR_CODE) =
				  UPPER (V_cntry_2_ltr_code)) DTL
	     WHERE     UPPER (ACTV.CID_CODE) = UPPER (DTL.CID_CODE)
		   AND UPPER (ACTV.CNTRY_2_LTR_CODE) =
			  UPPER (V_cntry_2_ltr_code)
		   AND ACTV.CID_CAT = P_inpt_cat
		   AND COND_TYP = 1
		   AND MNDTRY_FLD > 0
		   AND BITAND (ACTV.SI_VAT_TYP, POWER (2, V_TAX_CLC_TYP)) =
			  POWER (2, V_TAX_CLC_TYP)
		   AND BITAND (ACTV.MNDTRY_FLD, POWER (2, CID_SUB_CODE)) =
			  POWER (2, CID_SUB_CODE);
	 EXCEPTION
	    WHEN OTHERS
	    THEN
	       V_CNT := 0;
	 END;


	 IF V_CNT > 0
	 THEN
	    BEGIN
	       P_invld_inpt := 1;

	       P_err_msg :=
		     ias_gen_pkg.get_msg (P_LNG_NO   => get_usr_lang_no,
					  P_MSG_NO   => 1601)
		  || '	'
		  || Cid_addr_op_pkg.Get_cid_col_lbl (
			P_cntry_2_ltr	=> V_cntry_2_ltr_code,
			P_lang_code	=> GET_USR_LANG_CODE,
			P_lang_id	=> GET_USR_LANG_no,
			P_colmn_name	=> P_cid_clmn_nm,
			P_type		=> 2);


	       IF P_invld_inpt > 0
	       THEN
		  RETURN;
	       END IF;
	    EXCEPTION
	       WHEN OTHERS
	       THEN
		  P_invld_inpt := 0;
		  P_err_msg := NULL;
	    END;
	 END IF;
      ELSE
	 BEGIN
	    SELECT 1,
		      IAS_GEN_PKG.GET_MSG (P_LNG_NO   => GET_USR_LANG_no,
					   P_MSG_NO   => 4847)
		   || Cid_addr_op_pkg.Get_cid_col_lbl (
			 P_cntry_2_ltr	 => V_cntry_2_ltr_code,
			 P_lang_code	 => GET_USR_LANG_CODE,
			 P_lang_id	 => GET_USR_LANG_no,
			 P_colmn_name	 => Cid_clmn_nm,
			 P_type 	 => 2)
	      INTO P_invld_inpt, P_err_msg
	      FROM S_Cid_list_dtl_actv
	     WHERE     UPPER (Cid_clmn_nm) = UPPER (P_cid_clmn_nm)
		   AND Cntry_2_ltr_code = V_cntry_2_ltr_code
		   AND CASE P_inpt_cat
			  WHEN 1 THEN Suplly_actv
			  WHEN 2 THEN Cust_actv
			  ELSE 0
		       END > 0
		   AND CASE
			  WHEN Regex_vld IS NOT NULL
			  THEN
			     CASE
				WHEN REGEXP_LIKE (P_clmn_val, Regex_vld)
				THEN
				   1
				ELSE
				   0
			     END
			  ELSE
			     1
		       END = 0;

	    IF P_invld_inpt > 0
	    THEN
	       RETURN;
	    END IF;
	 EXCEPTION
	    WHEN OTHERS
	    THEN
	       P_invld_inpt := 0;
	       P_err_msg := NULL;
	 END;

	 BEGIN
	    SELECT Vld_func
	      INTO V_vld_func
	      FROM S_Cid_list_dtl_actv
	     WHERE     UPPER (Cid_clmn_nm) = UPPER (P_cid_clmn_nm)
		   AND Cntry_2_ltr_code = V_cntry_2_ltr_code
		   AND CASE P_inpt_cat
			  WHEN 1 THEN Suplly_actv
			  WHEN 2 THEN Cust_actv
			  ELSE 0
		       END > 0
		   AND Vld_func IS NOT NULL;
	 EXCEPTION
	    WHEN OTHERS
	    THEN
	       V_vld_func := NULL;
	 END;

	 IF V_vld_func IS NOT NULL
	 THEN
	    BEGIN
	       V_vld_func :=
		  REPLACE (UPPER (V_vld_func),
			   'P_INPT_DATA',
			   CHR (39) || UPPER (P_clmn_val) || CHR (39));

	       EXECUTE IMMEDIATE 'SELECT ' || V_vld_func || ' FROM DUAL '
		  INTO V_vld_func_val;

	       IF V_vld_func_val = 0
	       THEN
		  P_err_msg :=
			IAS_GEN_PKG.GET_MSG (P_LNG_NO	=> GET_USR_LANG_no,
					     P_MSG_NO	=> 4847)
		     || Cid_addr_op_pkg.Get_cid_col_lbl (
			   P_cntry_2_ltr   => V_cntry_2_ltr_code,
			   P_lang_code	   => GET_USR_LANG_CODE,
			   P_lang_id	   => GET_USR_LANG_no,
			   P_colmn_name    => P_cid_clmn_nm,
			   P_type	   => 2);
		  P_invld_inpt := 1;
		  RETURN;
	       END IF;
	    EXCEPTION
	       WHEN OTHERS
	       THEN
		  P_err_msg := NULL;
		  P_invld_inpt := 0;
	    END;
	 END IF;
      END IF;
   END Tst_addr_cid_inpt_fld;

   FUNCTION Get_cst_br_cntry_code (P_addr_cat	    NUMBER,
				   P_addr_typ	    NUMBER,
				   P_cst_br_code    VARCHAR2)
      RETURN VARCHAR2
   IS
      V_cntry_2_ltr_code   VARCHAR2 (2);
      V_CNT		   NUMBER (1);
   BEGIN
      BEGIN
	 SELECT Rtrn_clmn_val
	   INTO V_cntry_2_ltr_code
	   FROM (SELECT UPPER (Rtrn_clmn_val) Rtrn_clmn_val,
			Rcrd_sq,
			MAX (Rcrd_sq)
			   KEEP (DENSE_RANK LAST ORDER BY Rcrd_sq)
			   OVER ()
			   Lst_rcrd_sq
		   FROM Addr_lst_dtl
		  WHERE     Addr_cat = P_addr_cat
			AND Addr_typ = P_addr_typ
			AND Cst_br_code = P_cst_br_code
			AND UPPER (Cid_clmn_nm) = UPPER ('country'))
	  WHERE Rcrd_sq = Lst_rcrd_sq;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    RETURN NULL;
      END;

      IF V_cntry_2_ltr_code IS NOT NULL
      THEN
	 BEGIN
	    SELECT 1
	      INTO V_CNT
	      FROM S_CNTRY_INPT_CODE_ACTV
	     WHERE     UPPER (CNTRY_2_LTR) = UPPER (V_cntry_2_ltr_code)
		   AND UPPER (INPT_TBL_NM) = UPPER ('S_CID_LIST_DTL')
		   AND CNTRY_INPT_STS = 0
		   AND ROWNUM = 1;

	    V_cntry_2_ltr_code := 'A';
	 EXCEPTION
	    WHEN OTHERS
	    THEN
	       V_CNT := 0;
	 END;
      END IF;

      RETURN V_cntry_2_ltr_code;
   END Get_cst_br_cntry_code;

   PROCEDURE Tst_addr_cid_aftr_sav (P_inpt_cat		NUMBER,
				    P_addr_typ		NUMBER,
				    P_TAX_CLC_TYP	NUMBER,
				    P_cst_br_code	VARCHAR2,
				    P_invld_inpt    OUT NUMBER,
				    P_err_msg	    OUT VARCHAR2)
   AS
      V_cntry_2_ltr_code   VARCHAR2 (2);
      V_TAX_CLC_TYP	   NUMBER (2);
      V_FLD_VAL 	   VARCHAR2 (100);
   BEGIN
      IF NVL (P_TAX_CLC_TYP, 0) = 0
      THEN
	 V_TAX_CLC_TYP := 10;
      ELSE
	 BEGIN
	    SELECT CLC_TAX_TYP
	      INTO V_TAX_CLC_TYP
	      FROM GNR_TAX_TYP_CLC_MST
	     WHERE CLC_TYP_NO = P_TAX_CLC_TYP AND ROWNUM = 1;
	 EXCEPTION
	    WHEN OTHERS
	    THEN
	       V_TAX_CLC_TYP := 10;
	 END;
      END IF;

      V_cntry_2_ltr_code :=
	 NVL (
	    Get_cst_br_cntry_code (P_addr_cat	   => Usr_addr_cat,
				   P_addr_typ	   => Usr_addr_typ,
				   P_cst_br_code   => Usr_addr_cst_br_code),
	    GET_Usr_cntry_2_ltr_code);

      BEGIN
	 SELECT COUNT (Cid_clmn_nm),
		   ias_gen_pkg.get_msg (P_LNG_NO   => get_usr_lang_no,
					P_MSG_NO   => 1601)
		|| '{'
		|| LISTAGG (Cid_addr_op_pkg.Get_cid_col_lbl (
			       P_cntry_2_ltr   => V_cntry_2_ltr_code,
			       P_lang_code     => GET_USR_LANG_CODE,
			       P_lang_id       => GET_USR_LANG_no,
			       P_colmn_name    => Cid_clmn_nm,
			       P_type	       => 2),
			    ',' || CHR (10))
		   WITHIN GROUP (ORDER BY Cid_sub_code)
		|| '}'
	   INTO P_invld_inpt, P_err_msg
	   FROM (SELECT UPPER (Cid_clmn_nm) Cid_clmn_nm, Cid_sub_code
		   FROM S_Cid_list_dtl DTL, S_Cid_list_INPT_actv ACTV
		  WHERE     UPPER (DTL.Cid_CODE) = UPPER (ACTV.CID_CODE)
			AND Cntry_2_ltr_code = V_cntry_2_ltr_code
			AND ACTV.CID_CAT = P_inpt_cat
			AND COND_TYP = 1
			AND MNDTRY_FLD > 0
			AND BITAND (ACTV.SI_VAT_TYP,
				    POWER (2, V_TAX_CLC_TYP)) =
			       POWER (2, V_TAX_CLC_TYP)
			AND BITAND (ACTV.MNDTRY_FLD, POWER (2, CID_SUB_CODE)) =
			       POWER (2, CID_SUB_CODE)
		 MINUS
		 SELECT Cid_clmn_nm, Cid_sub_code
		   FROM (SELECT UPPER (Cid_clmn_nm) Cid_clmn_nm, Cid_sub_code
			   FROM (SELECT Cid_sub_code,
					UPPER (Cid_clmn_nm) Cid_clmn_nm,
					Rcrd_sq,
					MAX (
					   Rcrd_sq)
					KEEP (DENSE_RANK LAST ORDER BY
								 Rcrd_sq)
					OVER (
					   PARTITION BY Addr_cat,
							Addr_typ,
							UPPER (Cid_clmn_nm))
					   Lst_rcrd_sq,
					Clmn_val
				   FROM Addr_lst_dtl
				  WHERE     Addr_cat = P_inpt_cat
					AND Addr_typ = P_addr_typ
					AND Cst_br_code = P_cst_br_code
					AND NVL (Clmn_val, Clmn_val_f)
					       IS NOT NULL)
			  WHERE Rcrd_sq = Lst_rcrd_sq
			 UNION
			 SELECT UPPER (Cid_clmn_nm) Cid_clmn_nm, Cid_sub_code
			   FROM (SELECT Cid_sub_code,
					UPPER (Cid_clmn_nm) Cid_clmn_nm,
					Rcrd_sq,
					MAX (
					   Rcrd_sq)
					KEEP (DENSE_RANK LAST ORDER BY
								 Rcrd_sq)
					OVER (
					   PARTITION BY Cid_cat,
							UPPER (Cid_clmn_nm))
					   Lst_rcrd_sq,
					Clmn_val
				   FROM INPT_Cid_lst_dtl
				  WHERE     Cid_cat = P_inpt_cat
					AND Cst_br_code = P_cst_br_code
					AND Clmn_val IS NOT NULL)
			  WHERE Rcrd_sq = Lst_rcrd_sq));

	 RETURN;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    P_invld_inpt := 0;
	    P_err_msg := NULL;
      END;

      BEGIN
	 SELECT COUNT (M.CID_CODE),
		   ias_gen_pkg.get_msg (P_LNG_NO   => get_usr_lang_no,
					P_MSG_NO   => 1601)
		|| '{'
		|| LISTAGG (
		      Get_trns_lbl (P_cntry_2_ltr    => V_cntry_2_ltr_code,
				    P_lang_code      => GET_USR_LANG_CODE,
				    P_lang_id	     => GET_USR_LANG_no,
				    P_cid_name_lbl   => CID_NAME_LBL),
		      ',' || CHR (10))
		   WITHIN GROUP (ORDER BY M.CID_CODE)
		|| '}'
	   INTO P_invld_inpt, P_err_msg
	   FROM S_CID_LIST M,
		(  SELECT UPPER (ACTV.CID_CODE) CID_CODE
		     FROM S_Cid_list_dtl DTL, S_Cid_list_INPT_actv ACTV
		    WHERE     UPPER (DTL.Cid_CODE) = UPPER (ACTV.CID_CODE)
			  AND Cntry_2_ltr_code = V_cntry_2_ltr_code
			  AND ACTV.CID_CAT = P_inpt_cat
			  AND COND_TYP = 2
			  AND MNDTRY_FLD > 0
			  AND BITAND (ACTV.SI_VAT_TYP,
				      POWER (2, V_TAX_CLC_TYP)) =
				 POWER (2, V_TAX_CLC_TYP)
			  AND BITAND (ACTV.MNDTRY_FLD, POWER (2, CID_SUB_CODE)) =
				 POWER (2, CID_SUB_CODE)
		 GROUP BY UPPER (ACTV.CID_CODE)
		 MINUS
		 SELECT CID_CODE
		   FROM (  SELECT UPPER (CID_CODE) CID_CODE
			     FROM (SELECT CID_CODE,
					  UPPER (Cid_clmn_nm) Cid_clmn_nm,
					  Rcrd_sq,
					  MAX (
					     Rcrd_sq)
					  KEEP (DENSE_RANK LAST ORDER BY
								   Rcrd_sq)
					  OVER (
					     PARTITION BY Addr_cat,
							  Addr_typ,
							  UPPER (Cid_clmn_nm))
					     Lst_rcrd_sq,
					  Clmn_val
				     FROM Addr_lst_dtl
				    WHERE     Addr_cat = P_inpt_cat
					  AND Addr_typ = P_addr_typ
					  AND Cst_br_code = P_cst_br_code
					  AND NVL (Clmn_val, Clmn_val_f)
						 IS NOT NULL)
			    WHERE Rcrd_sq = Lst_rcrd_sq
			 GROUP BY UPPER (CID_cODE)
			 UNION
			   SELECT UPPER (CID_CODE) CID_CODE
			     FROM (SELECT CID_CODE,
					  UPPER (Cid_clmn_nm) Cid_clmn_nm,
					  Rcrd_sq,
					  MAX (
					     Rcrd_sq)
					  KEEP (DENSE_RANK LAST ORDER BY
								   Rcrd_sq)
					  OVER (
					     PARTITION BY Cid_cat,
							  UPPER (Cid_clmn_nm))
					     Lst_rcrd_sq,
					  Clmn_val
				     FROM INPT_Cid_lst_dtl
				    WHERE     Cid_cat = P_inpt_cat
					  AND Cst_br_code = P_cst_br_code
					  AND Clmn_val IS NOT NULL)
			    WHERE Rcrd_sq = Lst_rcrd_sq
			 GROUP BY UPPER (CID_cODE))) D
	  WHERE UPPER (M.CID_CODE) = UPPER (D.CID_CODE);

	 RETURN;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    P_invld_inpt := 0;
	    P_err_msg := NULL;
      END;

      BEGIN
	 FOR Addr_cur
	    IN (SELECT FLD_STS,
		       CID_CODE,
		       CLMN_NM,
		       CID_CLMN_NM,
		       CID_SUB_CODE
		  FROM (SELECT CASE
				  WHEN BITAND (ACTV.MNDTRY_FLD,
					       POWER (2, CID_SUB_CODE)) =
					  POWER (2, CID_SUB_CODE)
				  THEN
				     COND_TYP
				  WHEN BITAND (ACTV.OPTIONAL_FLD,
					       POWER (2, CID_SUB_CODE)) =
					  POWER (2, CID_SUB_CODE)
				  THEN
				     2
				  WHEN BITAND (ACTV.NOT_USED_FLD,
					       POWER (2, CID_SUB_CODE)) =
					  POWER (2, CID_SUB_CODE)
				  THEN
				     3
				  ELSE
				     4
			       END
				  FLD_STS,
			       ACTV.CID_CODE,
			       CID_CLMN_NM,
			       CLMN_NM,
			       CID_SUB_CODE
			  FROM S_CID_LIST_INPT_ACTV ACTV,
			       (SELECT CID_CODE,
				       D.CID_CLMN_NM,
				       CLMN_NM,
				       CID_SUB_CODE
				  FROM S_Cid_list_dtl M,
				       S_Cid_list_dtl_actv D
				 WHERE	   UPPER (M.CID_CLMN_NM) =
					      UPPER (D.CID_CLMN_NM)
				       AND UPPER (D.CNTRY_2_LTR_CODE) =
					      UPPER (V_cntry_2_ltr_code)) DTL
			 WHERE	   UPPER (ACTV.CID_CODE) =
				      UPPER (DTL.CID_CODE)
			       AND UPPER (ACTV.CNTRY_2_LTR_CODE) =
				      UPPER (V_cntry_2_ltr_code)
			       AND ACTV.CID_CAT = P_inpt_cat
			       AND BITAND (ACTV.SI_VAT_TYP,
					   POWER (2, V_TAX_CLC_TYP)) =
				      POWER (2, V_TAX_CLC_TYP))
		 WHERE FLD_STS IN (1, 2))
	 LOOP
	    IF UPPER (ADDR_CUR.CLMN_NM) = UPPER ('OTH_ICD_LST')
	    THEN
	       V_FLD_VAL :=
		  Get_cst_br_CID_fld_val (
		     P_CID_cat	     => P_INPT_cat,
		     P_cst_br_code   => P_cst_br_code,
		     p_cid_clmn_nm   => ADDR_CUR.cid_clmn_nm);
	    ELSE
	       V_FLD_VAL :=
		  Get_cst_br_addr_fld_val (
		     P_addr_cat      => P_INPT_cat,
		     P_addr_typ      => P_addr_typ,
		     P_cst_br_code   => P_cst_br_code,
		     p_cid_clmn_nm   => ADDR_CUR.cid_clmn_nm,
		     p_clmn_typ      => 1);
	    END IF;

	    IF V_FLD_VAL IS NULL AND ADDR_CUR.FLD_STS = 1
	    THEN
	       P_invld_inpt := 1;
	       P_err_msg :=
		     ias_gen_pkg.get_msg (P_LNG_NO   => get_usr_lang_no,
					  P_MSG_NO   => 1601)
		  || '	'
		  || Cid_addr_op_pkg.Get_cid_col_lbl (
			P_cntry_2_ltr	=> V_cntry_2_ltr_code,
			P_lang_code	=> GET_USR_LANG_CODE,
			P_lang_id	=> GET_USR_LANG_no,
			P_colmn_name	=> ADDR_CUR.Cid_clmn_nm,
			P_type		=> 2);
	       EXIT;
	    END IF;

	    IF V_FLD_VAL IS NOT NULL
	    THEN
	       Tst_addr_cid_inpt_fld (P_inpt_cat      => P_inpt_cat,
				      P_cid_clmn_nm   => Addr_cur.Cid_clmn_nm,
				      P_clmn_val      => V_FLD_VAL,
				      P_TAX_CLC_TYP   => P_TAX_CLC_TYP,
				      P_invld_inpt    => P_invld_inpt,
				      P_err_msg       => P_err_msg);

	       IF NVL (P_invld_inpt, 0) > 0
	       THEN
		  EXIT;
	       END IF;
	    END IF;

	    IF UPPER (ADDR_CUR.CLMN_NM) <> UPPER ('OTH_ICD_LST')
	    THEN
	       V_FLD_VAL :=
		  Get_cst_br_addr_fld_val (
		     P_addr_cat      => P_INPT_cat,
		     P_addr_typ      => P_addr_typ,
		     P_cst_br_code   => P_cst_br_code,
		     p_cid_clmn_nm   => ADDR_CUR.cid_clmn_nm,
		     p_clmn_typ      => 2);

	       IF V_FLD_VAL IS NOT NULL
	       THEN
		  Tst_addr_cid_inpt_fld (
		     P_inpt_cat      => P_inpt_cat,
		     P_cid_clmn_nm   => Addr_cur.Cid_clmn_nm,
		     P_clmn_val      => V_FLD_VAL,
		     P_TAX_CLC_TYP   => P_TAX_CLC_TYP,
		     P_invld_inpt    => P_invld_inpt,
		     P_err_msg	     => P_err_msg);

		  IF NVL (P_invld_inpt, 0) > 0
		  THEN
		     EXIT;
		  END IF;
	       END IF;

	       V_FLD_VAL :=
		  Get_cst_br_addr_fld_val (
		     P_addr_cat      => P_INPT_cat,
		     P_addr_typ      => P_addr_typ,
		     P_cst_br_code   => P_cst_br_code,
		     p_cid_clmn_nm   => ADDR_CUR.cid_clmn_nm,
		     p_clmn_typ      => 3);

	       IF V_FLD_VAL IS NOT NULL
	       THEN
		  Tst_addr_sys_fld (P_addr_cat	    => P_inpt_cat,
				    P_addr_typ	    => P_addr_typ,
				    P_cid_clmn_nm   => Addr_cur.Cid_clmn_nm,
				    P_clmn_val	    => V_FLD_VAL,
				    P_cst_br_code   => P_cst_br_code,
				    P_invld_inpt    => P_invld_inpt,
				    P_err_msg	    => P_err_msg);


		  IF NVL (P_invld_inpt, 0) > 0
		  THEN
		     EXIT;
		  END IF;
	       END IF;
	    END IF;
	 END LOOP;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    P_invld_inpt := 0;
	    P_err_msg := NULL;
      END;
   EXCEPTION
      WHEN OTHERS
      THEN
	 P_invld_inpt := 0;
	 P_err_msg := NULL;
   END Tst_addr_cid_aftr_sav;

   PROCEDURE Tst_addr_sys_fld (P_addr_cat	   NUMBER,
			       P_addr_typ	   NUMBER,
			       P_cid_clmn_nm	   VARCHAR2,
			       P_clmn_val	   VARCHAR2,
			       P_cst_br_code	   VARCHAR2,
			       P_invld_inpt    OUT NUMBER,
			       P_err_msg       OUT VARCHAR2)
   AS
      V_sql_str 	   VARCHAR2 (1000);
      V_vld_CNT 	   NUMBER (1);
      V_cntry_2_ltr_code   VARCHAR2 (2);
   BEGIN
      P_invld_inpt := 0;
      V_cntry_2_ltr_code :=
	 Get_cst_br_cntry_code (P_addr_cat	=> P_addr_cat,
				P_addr_typ	=> P_addr_typ,
				P_cst_br_code	=> P_cst_br_code);

      IF     V_cntry_2_ltr_code IS NULL
	 AND UPPER (P_cid_clmn_nm) <> UPPER ('country')
      THEN
	 P_err_msg :=
	       ias_gen_pkg.get_msg (P_LNG_NO   => get_usr_lang_no,
				    P_MSG_NO   => 1601)
	    || Cid_addr_op_pkg.Get_cid_col_lbl (
		  P_cntry_2_ltr   => NULL,
		  P_lang_code	  => GET_USR_LANG_CODE,
		  P_lang_id	  => GET_USR_LANG_no,
		  P_colmn_name	  => 'COUNTRY',
		  P_type	  => 2);
	 P_invld_inpt := 1;
	 RETURN;
      END IF;

      IF P_clmn_val IS NOT NULL
      THEN
	 BEGIN
	    SELECT    'select 1 from '
		   || SYS_TBL_NM
		   || '  where to_char('
		   || SYS_CLMN_NM
		   || ')='
		   || CHR (39)
		   || P_clmn_val
		   || CHR (39)
		   || ' '
		   || WHR_LST
		   || ' '
		   || ' and rownum<=1'
	      INTO V_sql_str
	      FROM S_Cid_list_dtl_actv c, S_CID_LIST_DTL_SYS_TBL s
	     WHERE     UPPER (c.Cid_clmn_nm) = UPPER (s.Cid_clmn_nm)
		   AND UPPER (c.Cid_clmn_nm) = UPPER (P_cid_clmn_nm)
		   AND Cntry_2_ltr_code = V_cntry_2_ltr_code
		   AND CASE P_ADDR_cat
			  WHEN 1 THEN Suplly_actv
			  WHEN 2 THEN Cust_actv
			  ELSE 0
		       END > 0;
	 EXCEPTION
	    WHEN OTHERS
	    THEN
	       P_invld_inpt := 0;
	       P_err_msg := NULL;
	 END;

	 IF V_sql_str IS NOT NULL
	 THEN
	    BEGIN
	       V_sql_str :=
		  REPLACE (
		     UPPER (V_sql_str),
		     'P_CNTRY_NO',
		     Get_cst_br_addr_fld_val (
			P_addr_cat	=> P_ADDR_cat,
			P_addr_typ	=> P_addr_typ,
			P_cst_br_code	=> P_cst_br_code,
			p_cid_clmn_nm	=> 'COUNTRY',
			p_clmn_typ	=> 3));
	       V_sql_str :=
		  REPLACE (
		     UPPER (V_sql_str),
		     'P_PROV_NO',
		     Get_cst_br_addr_fld_val (
			P_addr_cat	=> P_ADDR_cat,
			P_addr_typ	=> P_addr_typ,
			P_cst_br_code	=> P_cst_br_code,
			p_cid_clmn_nm	=> 'REGION',
			p_clmn_typ	=> 3));
	       V_sql_str :=
		  REPLACE (
		     UPPER (V_sql_str),
		     'P_CITY_NO',
		     Get_cst_br_addr_fld_val (
			P_addr_cat	=> P_ADDR_cat,
			P_addr_typ	=> P_addr_typ,
			P_cst_br_code	=> P_cst_br_code,
			p_cid_clmn_nm	=> 'SETTLEMENT',
			p_clmn_typ	=> 3));


	       BEGIN
		  EXECUTE IMMEDIATE V_sql_str INTO V_vld_CNT;
	       EXCEPTION
		  WHEN OTHERS
		  THEN
		     V_vld_CNT := 0;
	       END;

	       IF V_vld_CNT = 0
	       THEN
		  P_err_msg :=
			IAS_GEN_PKG.GET_MSG (P_LNG_NO	=> GET_USR_LANG_no,
					     P_MSG_NO	=> 4847)
		     || Cid_addr_op_pkg.Get_cid_col_lbl (
			   P_cntry_2_ltr   => V_cntry_2_ltr_code,
			   P_lang_code	   => GET_USR_LANG_CODE,
			   P_lang_id	   => GET_USR_LANG_no,
			   P_colmn_name    => P_cid_clmn_nm,
			   P_type	   => 2);
		  P_invld_inpt := 1;
		  RETURN;
	       END IF;
	    EXCEPTION
	       WHEN OTHERS
	       THEN
		  P_err_msg := SQLERRM;
		  P_invld_inpt := 1;
	    END;
	 END IF;
      END IF;
   END Tst_addr_sys_fld;

   FUNCTION Get_cst_br_addr_fld_val (P_addr_cat       NUMBER,
				     P_addr_typ       NUMBER,
				     P_cst_br_code    VARCHAR2,
				     p_cid_clmn_nm    VARCHAR2,
				     p_clmn_typ       NUMBER)
      RETURN VARCHAR2
   IS
      v_addr_fld_val   VARCHAR2 (50);
   BEGIN
      BEGIN
	 SELECT clmn_val
	   INTO v_addr_fld_val
	   FROM (SELECT UPPER (
			   CASE p_clmn_typ
			      WHEN 1
			      THEN
				 NVL (rtrn_clmn_val,
				      NVL (clmn_val, clmn_val_f))
			      WHEN 2
			      THEN
				 NVL (rtrn_clmn_val,
				      NVL (clmn_val_f, clmn_val))
			      WHEN 3
			      THEN
				 sys_clmn_val
			      ELSE
				 clmn_val
			   END)
			   clmn_val,
			Rcrd_sq,
			MAX (Rcrd_sq)
			   KEEP (DENSE_RANK LAST ORDER BY Rcrd_sq)
			   OVER ()
			   Lst_rcrd_sq
		   FROM Addr_lst_dtl
		  WHERE     Addr_cat = P_addr_cat
			AND Addr_typ = P_addr_typ
			AND Cst_br_code = P_cst_br_code
			AND UPPER (Cid_clmn_nm) = UPPER (p_cid_clmn_nm)
			AND Rcrd_sq = NVL (usr_addr_rcrd_sq, Rcrd_sq))
	  WHERE Rcrd_sq = Lst_rcrd_sq AND ROWNUM <= 1;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    v_addr_fld_val := NULL;
      END;

      RETURN v_addr_fld_val;
   END Get_cst_br_addr_fld_val;

   FUNCTION Get_cst_br_addr_full_str (P_addr_cat       NUMBER,
				      P_addr_typ       NUMBER,
				      P_cst_br_code    VARCHAR2,
				      P_typ	       NUMBER DEFAULT 0)
      RETURN VARCHAR2
   IS
      v_addr_fld_val	   VARCHAR2 (4000);
      v_cntry_2_ltr_code   VARCHAR2 (2);
   BEGIN
      v_cntry_2_ltr_code :=
	 NVL (
	    NVL (
	       get_cst_br_cntry_code (P_addr_cat      => P_addr_cat,
				      P_addr_typ      => P_addr_typ,
				      P_cst_br_code   => P_cst_br_code),
	       get_usr_cntry_2_ltr_code),
	    'A');

      BEGIN
	 IF P_TYP = 0
	 THEN
	    SELECT LISTAGG (
			 Get_trns_lbl (P_cntry_2_ltr	=> v_cntry_2_ltr_code,
				       P_lang_code	=> get_usr_lang_code,
				       P_lang_id	=> get_usr_lang_no,
				       P_cid_name_lbl	=> cid_shrt_name_lbl)
		      || '='
		      || addr.clmn_val
		      || CHR (10))
		   WITHIN GROUP (ORDER BY cid_code, cid_sub_code)
	      INTO v_addr_fld_val
	      FROM s_cid_list_dtl cid,
		   (SELECT cid_clmn_nm, clmn_val
		      FROM (SELECT UPPER (
				      CASE NVL (usr_LANG_NO,
						GNR_E_INVC_OP.GET_LANG_DFLT)
					 WHEN GNR_E_INVC_OP.GET_LANG_DFLT
					 THEN
					    NVL (clmn_val, clmn_val_f)
					 WHEN usr_LANG_NO
					 THEN
					    NVL (clmn_val_f, clmn_val)
					 ELSE
					    clmn_val
				      END)
				      clmn_val,
				   cid_clmn_nm,
				   Rcrd_sq,
				   MAX (Rcrd_sq)
				      KEEP (DENSE_RANK LAST ORDER BY Rcrd_sq)
				      OVER (PARTITION BY UPPER (cid_clmn_nm))
				      Lst_rcrd_sq
			      FROM Addr_lst_dtl
			     WHERE     Addr_cat = P_addr_cat
				   AND Addr_typ = P_addr_typ
				   AND Cst_br_code = P_cst_br_code
				   AND NVL (clmn_val, clmn_val_f) IS NOT NULL)
		     WHERE Rcrd_sq = Lst_rcrd_sq) addr
	     WHERE UPPER (cid.cid_clmn_nm) = UPPER (addr.cid_clmn_nm);
	 ELSE
	    SELECT LISTAGG (
			 '['
		      || Get_trns_lbl (P_cntry_2_ltr	=> v_cntry_2_ltr_code,
				       P_lang_code	=> get_usr_lang_code,
				       P_lang_id	=> get_usr_lang_no,
				       P_cid_name_lbl	=> cid_shrt_name_lbl)
		      || ']='
		      || addr.clmn_val
		      || ',')
		   WITHIN GROUP (ORDER BY cid_code, cid_sub_code)
	      INTO v_addr_fld_val
	      FROM s_cid_list_dtl cid,
		   (SELECT cid_clmn_nm, clmn_val
		      FROM (SELECT UPPER (
				      CASE NVL (usr_LANG_NO,
						GNR_E_INVC_OP.GET_LANG_DFLT)
					 WHEN GNR_E_INVC_OP.GET_LANG_DFLT
					 THEN
					    NVL (clmn_val, clmn_val_f)
					 WHEN usr_LANG_NO
					 THEN
					    NVL (clmn_val_f, clmn_val)
					 ELSE
					    clmn_val
				      END)
				      clmn_val,
				   cid_clmn_nm,
				   Rcrd_sq,
				   MAX (Rcrd_sq)
				      KEEP (DENSE_RANK LAST ORDER BY Rcrd_sq)
				      OVER (PARTITION BY UPPER (cid_clmn_nm))
				      Lst_rcrd_sq
			      FROM Addr_lst_dtl
			     WHERE     Addr_cat = P_addr_cat
				   AND Addr_typ = P_addr_typ
				   AND Cst_br_code = P_cst_br_code)
		     WHERE Rcrd_sq = Lst_rcrd_sq) addr
	     WHERE UPPER (cid.cid_clmn_nm) = UPPER (addr.cid_clmn_nm);
	 END IF;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    v_addr_fld_val := NULL;
      END;

      RETURN v_addr_fld_val;
   END Get_cst_br_addr_full_str;


   FUNCTION Get_cst_br_cid_fld_val (P_cid_cat	     NUMBER,
				    P_cst_br_code    VARCHAR2,
				    p_cid_clmn_nm    VARCHAR2)
      RETURN VARCHAR2
   IS
      v_cid_fld_val   VARCHAR2 (50);
   BEGIN
      BEGIN
	 SELECT clmn_val
	   INTO v_cid_fld_val
	   FROM (SELECT clmn_val,
			Rcrd_sq,
			MAX (Rcrd_sq)
			   KEEP (DENSE_RANK LAST ORDER BY Rcrd_sq)
			   OVER ()
			   Lst_rcrd_sq
		   FROM inpt_cid_lst_dtl
		  WHERE     Cid_cat = P_Cid_cat
			AND Cst_br_code = P_cst_br_code
			AND UPPER (Cid_clmn_nm) = UPPER (p_cid_clmn_nm)
			AND Rcrd_sq = NVL (usr_addr_rcrd_sq, Rcrd_sq))
	  WHERE Rcrd_sq = Lst_rcrd_sq AND ROWNUM <= 1;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    v_cid_fld_val := NULL;
      END;

      RETURN v_cid_fld_val;
   END Get_cst_br_cid_fld_val;

   FUNCTION Get_cst_br_cid_full_str (P_cid_cat	      NUMBER,
				     P_cst_br_code    VARCHAR2,
				     P_typ	      NUMBER DEFAULT 0)
      RETURN VARCHAR2
   IS
      v_cid_fld_val	   VARCHAR2 (4000);
      v_cntry_2_ltr_code   VARCHAR2 (2);
   BEGIN
      v_cntry_2_ltr_code :=
	 NVL (
	    NVL (
	       get_cst_br_cntry_code (P_addr_cat      => P_cid_cat,
				      P_addr_typ      => 1,
				      P_cst_br_code   => P_cst_br_code),
	       get_usr_cntry_2_ltr_code),
	    'A');

      BEGIN
	 IF NVL (P_TYP, 0) = 0
	 THEN
	    SELECT LISTAGG (
			 Get_trns_lbl (P_cntry_2_ltr	=> v_cntry_2_ltr_code,
				       P_lang_code	=> get_usr_lang_code,
				       P_lang_id	=> get_usr_lang_no,
				       P_cid_name_lbl	=> cid_shrt_name_lbl)
		      || '='
		      || addr.clmn_val
		      || CHR (10))
		   WITHIN GROUP (ORDER BY cid_code, cid_sub_code)
	      INTO v_cid_fld_val
	      FROM s_cid_list_dtl cid,
		   (SELECT cid_clmn_nm, clmn_val
		      FROM (SELECT clmn_val,
				   cid_clmn_nm,
				   Rcrd_sq,
				   MAX (Rcrd_sq)
				      KEEP (DENSE_RANK LAST ORDER BY Rcrd_sq)
				      OVER (PARTITION BY UPPER (cid_clmn_nm))
				      Lst_rcrd_sq
			      FROM inpt_cid_lst_dtl
			     WHERE     Cid_cat = P_Cid_cat
				   AND Cst_br_code = P_cst_br_code)
		     WHERE Rcrd_sq = Lst_rcrd_sq AND clmn_val IS NOT NULL)
		   addr
	     WHERE UPPER (cid.cid_clmn_nm) = UPPER (addr.cid_clmn_nm);
	 ELSE
	    SELECT LISTAGG (
			 '['
		      || Get_trns_lbl (P_cntry_2_ltr	=> v_cntry_2_ltr_code,
				       P_lang_code	=> get_usr_lang_code,
				       P_lang_id	=> get_usr_lang_no,
				       P_cid_name_lbl	=> cid_shrt_name_lbl)
		      || ']='
		      || addr.clmn_val
		      || ',')
		   WITHIN GROUP (ORDER BY cid_code, cid_sub_code)
	      INTO v_cid_fld_val
	      FROM s_cid_list_dtl cid,
		   (SELECT cid_clmn_nm, clmn_val
		      FROM (SELECT clmn_val,
				   cid_clmn_nm,
				   Rcrd_sq,
				   MAX (Rcrd_sq)
				      KEEP (DENSE_RANK LAST ORDER BY Rcrd_sq)
				      OVER (PARTITION BY UPPER (cid_clmn_nm))
				      Lst_rcrd_sq
			      FROM inpt_cid_lst_dtl
			     WHERE     Cid_cat = P_Cid_cat
				   AND Cst_br_code = P_cst_br_code)
		     WHERE Rcrd_sq = Lst_rcrd_sq) addr
	     WHERE UPPER (cid.cid_clmn_nm) = UPPER (addr.cid_clmn_nm);
	 END IF;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    v_cid_fld_val := NULL;
      END;

      RETURN v_cid_fld_val;
   END Get_cst_br_cid_full_str;

   PROCEDURE Crt_BR_new_CID_rcrd (P_cst_br_code    VARCHAR2,
				  P_cntry_2_ltr    VARCHAR2)
   AS
   BEGIN
      IF P_cst_br_code IS NULL
      THEN
	INSERT INTO INPT_CID_lst_dtl
	    (CID_cat, Cid_code,Cid_sub_code, Cid_clmn_nm, Cst_br_code,CID_STS, Rcrd_sq, Clmn_val)
	    SELECT CID_cat,Cid_code, Cid_sub_code,Cid_clmn_nm,Cst_br_code,  CID_STS, Rcrd_sq,Clmn_val
	    FROM(
	    SELECT 1 CID_CAT,
		   UPPER(Cid_code)Cid_code,
		   Cid_sub_code,
		   UPPER(s_Cid_list_dtl.Cid_clmn_nm)Cid_clmn_nm,
		   UPPER(BRN_NO) Cst_br_code
		  FROM s_Cid_list_dtl,s_Cid_list_dtl_actv, S_BRN
		    WHERE     UPPER (Clmn_nm) = UPPER ('OTH_ICD_LST')
		    AND UPPER(s_Cid_list_dtl.Cid_clmn_nm)=UPPER(s_Cid_list_dtl_ACTV.Cid_clmn_nm)
			      AND s_Cid_list_dtl_actv.Cntry_2_ltr_code=NVL( P_cntry_2_ltr,'A' )
			      AND s_Cid_list_dtl_actv.SUPLLY_ACTV > 0

	    MINUS
	    SELECT CID_cat,
		    UPPER(Cid_code)Cid_code,
		   Cid_sub_code,
		   UPPER(Cid_clmn_nm)Cid_clmn_nm,
		   UPPER(Cst_br_code) Cst_br_code
	      FROM INPT_CID_lst_dtl
	     WHERE CID_cat = 1 )
	     MODEL
	       REFERENCE   Cst_addr ON(
	    SELECT brn_no,
	     TAX_GRP_NO,  TAX_AUTH_CODE, TAN_CODE, PAN_CODE, NAI_TAX, RC_CODE, BRN_TAX_CODE, Capital, NIS_CODE FROM s_brn
	     )DIMENSION BY(brn_no)
	     MEASURES(TAX_GRP_NO, TAX_AUTH_CODE, TAN_CODE, PAN_CODE, NAI_TAX, RC_CODE, BRN_TAX_CODE, Capital, NIS_CODE)
	     DIMENSION BY(Cid_clmn_nm,Cst_br_code)
	     MEASURES( CID_cat,Cid_code,  Cid_sub_code, 1 CID_STS, 1 Rcrd_sq,	CAST(NULL AS VARCHAR2(50))Clmn_val)
	       RULES(
		    -- BRN_TAX_CODE --VAT_NO
		    Clmn_val['VAT_NO',ANY]=Cst_addr.BRN_TAX_CODE[CV(Cst_br_code)],
		    --RC_CODE	CRN_NO
		    Clmn_val['CRN_NO',ANY]=Cst_addr.RC_CODE[CV(Cst_br_code)],
		    --NAI_TAX TAX_SUB_CODE
		    Clmn_val['TAX_SUB_CODE',ANY]=Cst_addr.NAI_TAX[CV(Cst_br_code)],
		    --PAN_CODE	TAX_FXD_ACC
		    Clmn_val['TAX_FXD_ACC',ANY]=Cst_addr.PAN_CODE[CV(Cst_br_code)],
		     --Capital	CAPITAL
		    Clmn_val['CAPITAL',ANY]=Cst_addr.Capital[CV(Cst_br_code)],
		     --NIS_CODE  NIS_CODE
		    Clmn_val['NIS_CODE',ANY]=Cst_addr.NIS_CODE[CV(Cst_br_code)],
		    --TAX_GRP_NO  GR_VAT_NO
		    Clmn_val['GR_VAT_NO',ANY]=Cst_addr.TAX_GRP_NO[CV(Cst_br_code)],
		     --TAX_AUTH_CODE  TAX_AUT_CODE
		    Clmn_val['TAX_AUT_CODE',ANY]=Cst_addr.TAX_AUTH_CODE[CV(Cst_br_code)],
		     --TAN_CODE  TAX_ACC_NO
		    Clmn_val['TAX_ACC_NO',ANY]=Cst_addr.TAN_CODE[CV(Cst_br_code)]
	       );
      ELSE
	 INSERT INTO INPT_CID_lst_dtl (CID_cat,
				       Cid_code,
				       Cid_sub_code,
				       Cid_clmn_nm,
				       Cst_br_code,
				       CID_STS,
				       Rcrd_sq)
	    SELECT CID_cat,
		   Cid_code,
		   Cid_sub_code,
		   Cid_clmn_nm,
		   Cst_br_code,
		   1 CID_STS,
		   1 Rcrd_sq
	      FROM (SELECT 1 CID_CAT,
			   UPPER (Cid_code) Cid_code,
			   Cid_sub_code,
			   UPPER (s_Cid_list_dtl.Cid_clmn_nm) Cid_clmn_nm,
			   UPPER (P_cst_br_code) Cst_br_code
		      FROM s_Cid_list_dtl, s_Cid_list_dtl_actv
		     WHERE     UPPER (Clmn_nm) = UPPER ('OTH_ICD_LST')
			   AND UPPER (s_Cid_list_dtl.Cid_clmn_nm) =
				  UPPER (s_Cid_list_dtl_ACTV.Cid_clmn_nm)
			   AND s_Cid_list_dtl_actv.Cntry_2_ltr_code =
				  NVL (P_cntry_2_ltr, 'A')
			   AND s_Cid_list_dtl_actv.Suplly_actv > 0
		    MINUS
		    SELECT CID_cat,
			   UPPER (Cid_code) Cid_code,
			   Cid_sub_code,
			   UPPER (Cid_clmn_nm) Cid_clmn_nm,
			   UPPER (Cst_br_code) Cst_br_code
		      FROM INPT_CID_lst_dtl
		     WHERE     CID_cat = 1
			   AND UPPER (Cst_br_code) = UPPER (P_cst_br_code));
      END IF;
   END Crt_BR_new_CID_rcrd;

   FUNCTION tst_cst_br_cid_fld_sts (p_cntry_2_ltr_code	    VARCHAR2,
				    P_inpt_cat		    NUMBER,
				    P_TAX_CLC_TYP	    NUMBER,
				    p_invc_trns_code	    NUMBER,
				    P_VAT_EXMPT_RSN_CODE    VARCHAR2,
				    p_cid_clmn_nm	    VARCHAR2)
      RETURN NUMBER
   IS
      V_cntry_2_ltr_code   VARCHAR2 (2);
      V_FLD_STS 	   NUMBER (5);
      V_TAX_CLC_TYP	   NUMBER (2);
   BEGIN
      IF NVL (P_TAX_CLC_TYP, 0) = 0
      THEN
	 V_TAX_CLC_TYP := 10;
      ELSE
	 BEGIN
	    SELECT CLC_TAX_TYP
	      INTO V_TAX_CLC_TYP
	      FROM GNR_TAX_TYP_CLC_MST
	     WHERE CLC_TYP_NO = P_TAX_CLC_TYP AND ROWNUM = 1;
	 EXCEPTION
	    WHEN OTHERS
	    THEN
	       V_TAX_CLC_TYP := 10;
	 END;
      END IF;

      V_cntry_2_ltr_code := NVL (p_cntry_2_ltr_code, GET_usr_cntry_2_ltr_code);

      IF NVL (p_invc_trns_code, 0) = 0
      THEN
	 BEGIN
	    SELECT CASE
		      WHEN BITAND (ACTV.MNDTRY_FLD, POWER (2, CID_SUB_CODE)) =
			      POWER (2, CID_SUB_CODE)
		      THEN
			 COND_TYP
		      WHEN BITAND (ACTV.OPTIONAL_FLD,
				   POWER (2, CID_SUB_CODE)) =
			      POWER (2, CID_SUB_CODE)
		      THEN
			 2
		      WHEN BITAND (ACTV.NOT_USED_FLD,
				   POWER (2, CID_SUB_CODE)) =
			      POWER (2, CID_SUB_CODE)
		      THEN
			 3
		      ELSE
			 4
		   END
	      INTO V_FLD_STS
	      FROM S_CID_LIST_INPT_ACTV ACTV,
		   (SELECT CID_CODE, D.CID_CLMN_NM, CID_SUB_CODE
		      FROM S_Cid_list_dtl M, S_Cid_list_dtl_actv D
		     WHERE     UPPER (D.cid_clmn_nm) = UPPER (P_cid_clmn_nm)
			   AND UPPER (M.CID_CLMN_NM) = UPPER (D.CID_CLMN_NM)
			   AND UPPER (D.CNTRY_2_LTR_CODE) =
				  UPPER (V_cntry_2_ltr_code)) DTL
	     WHERE     UPPER (ACTV.CID_CODE) = UPPER (DTL.CID_CODE)
		   AND UPPER (ACTV.CNTRY_2_LTR_CODE) =
			  UPPER (V_cntry_2_ltr_code)
		   AND ACTV.CID_CAT = P_inpt_cat
		   --AND COND_TYP = 1
		   --AND MNDTRY_FLD > 0
		   AND BITAND (ACTV.SI_VAT_TYP, POWER (2, V_TAX_CLC_TYP)) =
			  POWER (2, V_TAX_CLC_TYP);
	 EXCEPTION
	    WHEN OTHERS
	    THEN
	       V_FLD_STS := 4;
	 END;

	 BEGIN
	    SELECT CASE
		      WHEN BITAND (ACTV.MNDTRY_FLD, POWER (2, CID_SUB_CODE)) =
			      POWER (2, CID_SUB_CODE)
		      THEN
			 COND_TYP
		      WHEN BITAND (ACTV.OPTIONAL_FLD,
				   POWER (2, CID_SUB_CODE)) =
			      POWER (2, CID_SUB_CODE)
		      THEN
			 2
		      WHEN BITAND (ACTV.NOT_USED_FLD,
				   POWER (2, CID_SUB_CODE)) =
			      POWER (2, CID_SUB_CODE)
		      THEN
			 3
		      ELSE
			 4
		   END
	      INTO V_FLD_STS
	      FROM S_CID_LIST_INVC_ACTV ACTV,
		   (SELECT CID_CODE, D.CID_CLMN_NM, CID_SUB_CODE
		      FROM S_Cid_list_dtl M, S_Cid_list_dtl_actv D
		     WHERE     UPPER (D.cid_clmn_nm) = UPPER (P_cid_clmn_nm)
			   AND UPPER (M.CID_CLMN_NM) = UPPER (D.CID_CLMN_NM)
			   AND UPPER (D.CNTRY_2_LTR_CODE) =
				  UPPER (V_cntry_2_ltr_code)) DTL
	     WHERE     UPPER (ACTV.CID_CODE) = UPPER (DTL.CID_CODE)
		   AND UPPER (ACTV.CNTRY_2_LTR_CODE) =
			  UPPER (V_cntry_2_ltr_code)
		   AND ACTV.CID_CAT = P_inpt_cat
		   --AND COND_TYP = 1
		   --AND MNDTRY_FLD > 0
		   AND BITAND (ACTV.SI_VAT_TYP, POWER (2, V_TAX_CLC_TYP)) =
			  POWER (2, V_TAX_CLC_TYP)
		   AND BITAND (ACTV.INVC_TRNS_CODE, P_INVC_TRNS_CODE) =
			  P_INVC_TRNS_CODE
		   AND UPPER (
			  NVL (
			     VAT_EXMPT_RSN_CODE,
				','
			     || UPPER (
				   NVL (P_VAT_EXMPT_RSN_CODE, '0') || ','))) LIKE
			     '%,'
			  || UPPER (NVL (P_VAT_EXMPT_RSN_CODE, '0'))
			  || ',%';
	 EXCEPTION
	    WHEN OTHERS
	    THEN
	       V_FLD_STS := 4;
	 END;
      END IF;

      RETURN V_FLD_STS;
   END tst_cst_br_cid_fld_sts;

   FUNCTION GET_cst_br_cid_fld_VAL (P_inpt_cat		    NUMBER,
				    P_ADDR_TYP		    NUMBER,
				    P_TAX_CLC_TYP	    NUMBER,
				    p_invc_trns_code	    NUMBER,
				    P_VAT_EXMPT_RSN_CODE    VARCHAR2,
				    p_cid_clmn_nm	    VARCHAR2,
				    P_CST_BR_CODE	    VARCHAR2,
				    p_rcrd_sq		    NUMBER DEFAULT 1)
      RETURN VARCHAR2
   IS
      V_CLMN_NM   VARCHAR2 (50);
      V_FLD_VAL   VARCHAR2 (50);
      V_FLD_STS   NUMBER (1);
   BEGIN
      IF NVL (p_rcrd_sq, 0) > 0
      THEN
	 usr_addr_rcrd_sq := p_rcrd_sq;
      END IF;

      SELECT DTL.CLMN_NM
	INTO V_CLMN_NM
	FROM S_CID_LIST_DTL DTL, S_CID_LIST_DTL_ACTV ACTV
       WHERE	 UPPER (DTL.cid_clmn_nm) = UPPER (ACTV.cid_clmn_nm)
	     AND UPPER (cntry_2_ltr_code) = UPPER (usr_cntry_2_ltr_code)
	     AND UPPER (ACTV.cid_clmn_nm) = UPPER (P_cid_clmn_nm)
	     AND ROWNUM <= 1;

      V_FLD_STS :=
	 tst_cst_br_cid_fld_sts (
	    p_cntry_2_ltr_code	   => usr_cntry_2_ltr_code,
	    P_inpt_cat		   => P_inpt_cat,
	    P_TAX_CLC_TYP	   => P_TAX_CLC_TYP,
	    p_invc_trns_code	   => p_invc_trns_code,
	    P_VAT_EXMPT_RSN_CODE   => P_VAT_EXMPT_RSN_CODE,
	    p_cid_clmn_nm	   => p_cid_clmn_nm);

      IF V_FLD_STS IN (1, 2)
      THEN
	 IF UPPER (V_CLMN_NM) = UPPER ('OTH_ICD_LST')
	 THEN
	    V_FLD_VAL :=
	       Get_cst_br_CID_fld_val (P_CID_cat       => P_INPT_cat,
				       P_cst_br_code   => P_cst_br_code,
				       p_cid_clmn_nm   => p_cid_clmn_nm);
	 ELSE
	    V_FLD_VAL :=
	       Get_cst_br_addr_fld_val (
		  P_addr_cat	  => P_INPT_cat,
		  P_addr_typ	  => P_addr_typ,
		  P_cst_br_code   => P_cst_br_code,
		  p_cid_clmn_nm   => p_cid_clmn_nm,
		  p_clmn_typ	  => CASE NVL (usr_LANG_NO,
					       GNR_E_INVC_OP.GET_LANG_DFLT)
				       WHEN GNR_E_INVC_OP.GET_LANG_DFLT
				       THEN
					  1
				       ELSE
					  2
				    END);
	 END IF;
      ELSE
	 V_FLD_VAL := NULL;
      END IF;

      RETURN V_FLD_VAL;
   EXCEPTION
      WHEN OTHERS
      THEN
	 RETURN NULL;
   END GET_cst_br_cid_fld_VAL;

   PROCEDURE Tst_addr_cid_INVC_aftr_sav (P_inpt_cat		    NUMBER,
					 P_addr_typ		    NUMBER,
					 P_TAX_CLC_TYP		    NUMBER,
					 p_invc_trns_code	    NUMBER,
					 P_VAT_EXMPT_RSN_CODE	    VARCHAR2,
					 P_cst_br_code		    VARCHAR2,
					 P_invld_inpt		OUT NUMBER,
					 P_err_msg		OUT VARCHAR2)
   AS
      V_cntry_2_ltr_code   VARCHAR2 (2);
      V_TAX_CLC_TYP	   NUMBER (2);
      V_FLD_VAL 	   VARCHAR2 (100);
   BEGIN
      IF NVL (P_TAX_CLC_TYP, 0) = 0
      THEN
	 V_TAX_CLC_TYP := 10;
      ELSE
	 BEGIN
	    SELECT CLC_TAX_TYP
	      INTO V_TAX_CLC_TYP
	      FROM GNR_TAX_TYP_CLC_MST
	     WHERE CLC_TYP_NO = P_TAX_CLC_TYP AND ROWNUM = 1;
	 EXCEPTION
	    WHEN OTHERS
	    THEN
	       V_TAX_CLC_TYP := 10;
	 END;
      END IF;

      V_cntry_2_ltr_code := GET_Usr_cntry_2_ltr_code;

      BEGIN
	 SELECT COUNT (Cid_clmn_nm),
		   ias_gen_pkg.get_msg (P_LNG_NO   => get_usr_lang_no,
					P_MSG_NO   => 1601)
		|| '{'
		|| LISTAGG (Cid_addr_op_pkg.Get_cid_col_lbl (
			       P_cntry_2_ltr   => V_cntry_2_ltr_code,
			       P_lang_code     => GET_USR_LANG_CODE,
			       P_lang_id       => GET_USR_LANG_no,
			       P_colmn_name    => Cid_clmn_nm,
			       P_type	       => 2),
			    ',' || CHR (10))
		   WITHIN GROUP (ORDER BY Cid_sub_code)
		|| '}'
	   INTO P_invld_inpt, P_err_msg
	   FROM (SELECT UPPER (Cid_clmn_nm) Cid_clmn_nm, Cid_sub_code
		   FROM S_Cid_list_dtl DTL, S_Cid_list_INVC_actv ACTV
		  WHERE     UPPER (DTL.Cid_CODE) = UPPER (ACTV.CID_CODE)
			AND Cntry_2_ltr_code = V_cntry_2_ltr_code
			AND ACTV.CID_CAT = P_inpt_cat
			AND COND_TYP = 1
			AND MNDTRY_FLD > 0
			AND BITAND (ACTV.SI_VAT_TYP,
				    POWER (2, V_TAX_CLC_TYP)) =
			       POWER (2, V_TAX_CLC_TYP)
			AND BITAND (ACTV.INVC_TRNS_CODE, P_INVC_TRNS_CODE) =
			       P_INVC_TRNS_CODE
			AND BITAND (ACTV.MNDTRY_FLD, POWER (2, CID_SUB_CODE)) =
			       POWER (2, CID_SUB_CODE)
			AND UPPER (
			       NVL (
				  VAT_EXMPT_RSN_CODE,
				     ','
				  || UPPER (
					   NVL (P_VAT_EXMPT_RSN_CODE, '0')
					|| ','))) LIKE
				  '%,'
			       || UPPER (NVL (P_VAT_EXMPT_RSN_CODE, '0'))
			       || ',%'
		 MINUS
		 SELECT Cid_clmn_nm, Cid_sub_code
		   FROM (SELECT UPPER (Cid_clmn_nm) Cid_clmn_nm, Cid_sub_code
			   FROM (SELECT Cid_sub_code,
					UPPER (Cid_clmn_nm) Cid_clmn_nm,
					Rcrd_sq,
					MAX (
					   Rcrd_sq)
					KEEP (DENSE_RANK LAST ORDER BY
								 Rcrd_sq)
					OVER (
					   PARTITION BY Addr_cat,
							Addr_typ,
							UPPER (Cid_clmn_nm))
					   Lst_rcrd_sq,
					Clmn_val
				   FROM Addr_lst_dtl
				  WHERE     Addr_cat = P_inpt_cat
					AND Addr_typ = P_addr_typ
					AND Cst_br_code = P_cst_br_code
					AND NVL (Clmn_val, Clmn_val_f)
					       IS NOT NULL)
			  WHERE Rcrd_sq = Lst_rcrd_sq
			 UNION
			 SELECT UPPER (Cid_clmn_nm) Cid_clmn_nm, Cid_sub_code
			   FROM (SELECT Cid_sub_code,
					UPPER (Cid_clmn_nm) Cid_clmn_nm,
					Rcrd_sq,
					MAX (
					   Rcrd_sq)
					KEEP (DENSE_RANK LAST ORDER BY
								 Rcrd_sq)
					OVER (
					   PARTITION BY Cid_cat,
							UPPER (Cid_clmn_nm))
					   Lst_rcrd_sq,
					Clmn_val
				   FROM INPT_Cid_lst_dtl
				  WHERE     Cid_cat = P_inpt_cat
					AND Cst_br_code = P_cst_br_code
					AND Clmn_val IS NOT NULL)
			  WHERE Rcrd_sq = Lst_rcrd_sq));

	 RETURN;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    P_invld_inpt := 0;
	    P_err_msg := NULL;
      END;



      BEGIN
	 SELECT COUNT (M.CID_CODE),
		   ias_gen_pkg.get_msg (P_LNG_NO   => get_usr_lang_no,
					P_MSG_NO   => 1601)
		|| '{'
		|| LISTAGG (
		      Get_trns_lbl (P_cntry_2_ltr    => V_cntry_2_ltr_code,
				    P_lang_code      => GET_USR_LANG_CODE,
				    P_lang_id	     => GET_USR_LANG_no,
				    P_cid_name_lbl   => CID_NAME_LBL),
		      ',' || CHR (10))
		   WITHIN GROUP (ORDER BY M.CID_CODE)
		|| '}'
	   INTO P_invld_inpt, P_err_msg
	   FROM S_CID_LIST M,
		(  SELECT UPPER (ACTV.CID_CODE) CID_CODE
		     FROM S_Cid_list_dtl DTL, S_Cid_list_INVC_actv ACTV
		    WHERE     UPPER (DTL.Cid_CODE) = UPPER (ACTV.CID_CODE)
			  AND Cntry_2_ltr_code = V_cntry_2_ltr_code
			  AND ACTV.CID_CAT = P_inpt_cat
			  AND COND_TYP = 2
			  AND MNDTRY_FLD > 0
			  AND BITAND (ACTV.SI_VAT_TYP,
				      POWER (2, V_TAX_CLC_TYP)) =
				 POWER (2, V_TAX_CLC_TYP)
			  AND BITAND (ACTV.MNDTRY_FLD, POWER (2, CID_SUB_CODE)) =
				 POWER (2, CID_SUB_CODE)
			  AND BITAND (ACTV.INVC_TRNS_CODE, P_INVC_TRNS_CODE) =
				 P_INVC_TRNS_CODE
			  AND UPPER (
				 NVL (
				    VAT_EXMPT_RSN_CODE,
				       ','
				    || UPPER (
					     NVL (P_VAT_EXMPT_RSN_CODE, '0')
					  || ','))) LIKE
				    '%,'
				 || UPPER (NVL (P_VAT_EXMPT_RSN_CODE, '0'))
				 || ',%'
		 GROUP BY UPPER (ACTV.CID_CODE)
		 MINUS
		 SELECT CID_CODE
		   FROM (  SELECT UPPER (CID_CODE) CID_CODE
			     FROM (SELECT CID_CODE,
					  UPPER (Cid_clmn_nm) Cid_clmn_nm,
					  Rcrd_sq,
					  MAX (
					     Rcrd_sq)
					  KEEP (DENSE_RANK LAST ORDER BY
								   Rcrd_sq)
					  OVER (
					     PARTITION BY Addr_cat,
							  Addr_typ,
							  UPPER (Cid_clmn_nm))
					     Lst_rcrd_sq,
					  Clmn_val
				     FROM Addr_lst_dtl
				    WHERE     Addr_cat = P_inpt_cat
					  AND Addr_typ = P_addr_typ
					  AND Cst_br_code = P_cst_br_code
					  AND NVL (Clmn_val, Clmn_val_f)
						 IS NOT NULL)
			    WHERE Rcrd_sq = Lst_rcrd_sq
			 GROUP BY UPPER (CID_cODE)
			 UNION
			   SELECT UPPER (CID_CODE) CID_CODE
			     FROM (SELECT CID_CODE,
					  UPPER (Cid_clmn_nm) Cid_clmn_nm,
					  Rcrd_sq,
					  MAX (
					     Rcrd_sq)
					  KEEP (DENSE_RANK LAST ORDER BY
								   Rcrd_sq)
					  OVER (
					     PARTITION BY Cid_cat,
							  UPPER (Cid_clmn_nm))
					     Lst_rcrd_sq,
					  Clmn_val
				     FROM INPT_Cid_lst_dtl
				    WHERE     Cid_cat = P_inpt_cat
					  AND Cst_br_code = P_cst_br_code
					  AND Clmn_val IS NOT NULL)
			    WHERE Rcrd_sq = Lst_rcrd_sq
			 GROUP BY UPPER (CID_cODE))) D
	  WHERE UPPER (M.CID_CODE) = UPPER (D.CID_CODE);

	 RETURN;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    P_invld_inpt := 0;
	    P_err_msg := NULL;
      END;

      BEGIN
	 FOR Addr_cur
	    IN (SELECT FLD_STS,
		       CID_CODE,
		       CLMN_NM,
		       CID_CLMN_NM,
		       CID_SUB_CODE
		  FROM (SELECT CASE
				  WHEN BITAND (ACTV.MNDTRY_FLD,
					       POWER (2, CID_SUB_CODE)) =
					  POWER (2, CID_SUB_CODE)
				  THEN
				     COND_TYP
				  WHEN BITAND (ACTV.OPTIONAL_FLD,
					       POWER (2, CID_SUB_CODE)) =
					  POWER (2, CID_SUB_CODE)
				  THEN
				     2
				  WHEN BITAND (ACTV.NOT_USED_FLD,
					       POWER (2, CID_SUB_CODE)) =
					  POWER (2, CID_SUB_CODE)
				  THEN
				     3
				  ELSE
				     4
			       END
				  FLD_STS,
			       ACTV.CID_CODE,
			       CID_CLMN_NM,
			       CID_SUB_CODE,
			       CLMN_NM
			  FROM S_CID_LIST_INVC_ACTV ACTV,
			       (SELECT CID_CODE,
				       D.CID_CLMN_NM,
				       CLMN_NM,
				       CID_SUB_CODE
				  FROM S_Cid_list_dtl M,
				       S_Cid_list_dtl_actv D
				 WHERE	   UPPER (M.CID_CLMN_NM) =
					      UPPER (D.CID_CLMN_NM)
				       AND UPPER (D.CNTRY_2_LTR_CODE) =
					      UPPER (V_cntry_2_ltr_code)) DTL
			 WHERE	   UPPER (ACTV.CID_CODE) =
				      UPPER (DTL.CID_CODE)
			       AND UPPER (ACTV.CNTRY_2_LTR_CODE) =
				      UPPER (V_cntry_2_ltr_code)
			       AND ACTV.CID_CAT = P_inpt_cat
			       AND BITAND (ACTV.SI_VAT_TYP,
					   POWER (2, V_TAX_CLC_TYP)) =
				      POWER (2, V_TAX_CLC_TYP)
			       AND BITAND (ACTV.INVC_TRNS_CODE,
					   P_INVC_TRNS_CODE) =
				      P_INVC_TRNS_CODE
			       AND UPPER (
				      NVL (
					 VAT_EXMPT_RSN_CODE,
					    ','
					 || UPPER (
						  NVL (P_VAT_EXMPT_RSN_CODE,
						       '0')
					       || ','))) LIKE
					 '%,'
				      || UPPER (
					    NVL (P_VAT_EXMPT_RSN_CODE, '0'))
				      || ',%')
		 WHERE FLD_STS IN (1, 2))
	 LOOP
	    IF UPPER (ADDR_CUR.CLMN_NM) = UPPER ('OTH_ICD_LST')
	    THEN
	       V_FLD_VAL :=
		  Get_cst_br_CID_fld_val (
		     P_CID_cat	     => P_INPT_cat,
		     P_cst_br_code   => P_cst_br_code,
		     p_cid_clmn_nm   => ADDR_CUR.cid_clmn_nm);
	    ELSE
	       V_FLD_VAL :=
		  Get_cst_br_addr_fld_val (
		     P_addr_cat      => P_INPT_cat,
		     P_addr_typ      => P_addr_typ,
		     P_cst_br_code   => P_cst_br_code,
		     p_cid_clmn_nm   => ADDR_CUR.cid_clmn_nm,
		     p_clmn_typ      => CASE NVL (usr_LANG_NO,
						  GNR_E_INVC_OP.GET_LANG_DFLT)
					  WHEN GNR_E_INVC_OP.GET_LANG_DFLT
					  THEN
					     1
					  ELSE
					     2
				       END);
	    END IF;

	    IF V_FLD_VAL IS NULL AND ADDR_CUR.FLD_STS = 1
	    THEN
	       P_invld_inpt := 1;
	       P_err_msg :=
		     ias_gen_pkg.get_msg (P_LNG_NO   => get_usr_lang_no,
					  P_MSG_NO   => 1601)
		  || '	'
		  || Cid_addr_op_pkg.Get_cid_col_lbl (
			P_cntry_2_ltr	=> V_cntry_2_ltr_code,
			P_lang_code	=> GET_USR_LANG_CODE,
			P_lang_id	=> GET_USR_LANG_no,
			P_colmn_name	=> ADDR_CUR.Cid_clmn_nm,
			P_type		=> 2);
	       EXIT;
	    END IF;

	    IF V_FLD_VAL IS NOT NULL
	    THEN
	       Tst_addr_cid_inpt_fld (P_inpt_cat      => P_inpt_cat,
				      P_cid_clmn_nm   => Addr_cur.Cid_clmn_nm,
				      P_clmn_val      => V_FLD_VAL,
				      P_TAX_CLC_TYP   => P_TAX_CLC_TYP,
				      P_invld_inpt    => P_invld_inpt,
				      P_err_msg       => P_err_msg);

	       IF NVL (P_invld_inpt, 0) > 0
	       THEN
		  EXIT;
	       END IF;
	    END IF;
	 END LOOP;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    P_invld_inpt := 0;
	    P_err_msg := NULL;
      END;
   EXCEPTION
      WHEN OTHERS
      THEN
	 P_invld_inpt := 0;
	 P_err_msg := NULL;
   END Tst_addr_cid_INVC_aftr_sav;

   FUNCTION GET_cst_br_ONE_cid_VAL (P_inpt_cat		    NUMBER,
				    P_TAX_CLC_TYP	    NUMBER,
				    p_invc_trns_code	    NUMBER,
				    P_VAT_EXMPT_RSN_CODE    VARCHAR2,
				    p_cid_CODE		    VARCHAR2,
				    P_CST_BR_CODE	    VARCHAR2,
				    p_rcrd_sq		    NUMBER DEFAULT 1)
      RETURN VARCHAR2
   IS
      V_SCHEMA_NM	   VARCHAR2 (50);
      V_FLD_VAL 	   VARCHAR2 (50);
      V_TAX_CLC_TYP	   NUMBER (2);
   BEGIN
      IF NVL (P_TAX_CLC_TYP, 0) = 0
      THEN
	 V_TAX_CLC_TYP := 10;
      ELSE
	 BEGIN
	    SELECT CLC_TAX_TYP
	      INTO V_TAX_CLC_TYP
	      FROM GNR_TAX_TYP_CLC_MST
	     WHERE CLC_TYP_NO = P_TAX_CLC_TYP AND ROWNUM = 1;
	 EXCEPTION
	    WHEN OTHERS
	    THEN
	       V_TAX_CLC_TYP := 10;
	 END;
      END IF;


      IF NVL (p_rcrd_sq, 0) > 0
      THEN
	 usr_addr_rcrd_sq := p_rcrd_sq;
      END IF;

      FOR I
	 IN (  SELECT ACTV.CID_CODE, DTL.CLMN_NM, dtl.cid_clmn_nm
		 FROM S_Cid_list_dtl DTL, S_Cid_list_INVC_actv ACTV
		WHERE	  UPPER (DTL.Cid_CODE) = UPPER (ACTV.CID_CODE)
		      AND UPPER (Cntry_2_ltr_code) = UPPER (USR_cntry_2_ltr_code)
		      AND ACTV.CID_CAT = P_inpt_cat
		      AND COND_TYP = 2
		      AND MNDTRY_FLD > 0
		      AND BITAND (ACTV.SI_VAT_TYP, POWER (2, V_TAX_CLC_TYP)) =
			     POWER (2, V_TAX_CLC_TYP)
		      AND BITAND (ACTV.MNDTRY_FLD, POWER (2, CID_SUB_CODE)) =
			     POWER (2, CID_SUB_CODE)
		      AND BITAND (ACTV.INVC_TRNS_CODE, P_INVC_TRNS_CODE) =
			     P_INVC_TRNS_CODE
		      AND UPPER (
			     NVL (
				VAT_EXMPT_RSN_CODE,
				   ','
				|| UPPER (
				      NVL (P_VAT_EXMPT_RSN_CODE, '0') || ','))) LIKE
				'%,'
			     || UPPER (NVL (P_VAT_EXMPT_RSN_CODE, '0'))
			     || ',%'
	     ORDER BY DTL.CID_CODE,
		      CASE
			 WHEN CID_CODE = 'VA' THEN CID_SUB_CODE * -1
			 ELSE CID_SUB_CODE
		      END)
      LOOP
	 IF UPPER (I.CLMN_NM) = UPPER ('OTH_ICD_LST')
	 THEN
	    V_FLD_VAL :=
	       Get_cst_br_CID_fld_val (P_CID_cat       => P_INPT_cat,
				       P_cst_br_code   => P_cst_br_code,
				       p_cid_clmn_nm   => I.cid_clmn_nm);
	 ELSE
	    V_FLD_VAL :=
	       Get_cst_br_addr_fld_val (
		  P_addr_cat	  => P_INPT_cat,
		  P_addr_typ	  => 1,
		  P_cst_br_code   => P_cst_br_code,
		  p_cid_clmn_nm   => I.cid_clmn_nm,
		  p_clmn_typ	  => CASE NVL (usr_LANG_NO,
					       GNR_E_INVC_OP.GET_LANG_DFLT)
				       WHEN GNR_E_INVC_OP.GET_LANG_DFLT
				       THEN
					  1
				       ELSE
					  2
				    END);
	 END IF;

	 IF V_FLD_VAL IS NOT NULL
	 THEN
	    BEGIN
	       SELECT SCHEMA_ID
		 INTO V_SCHEMA_NM
		 FROM S_Cid_list_dtl_ACTV
		WHERE	  UPPER (Cntry_2_ltr_code) =
			     UPPER (USR_cntry_2_ltr_code)
		      AND UPPER (CID_CLMN_NM) = UPPER (I.CID_CLMN_NM)
		      AND ROWNUM <= 1;
	    EXCEPTION
	       WHEN OTHERS
	       THEN
		  NULL;
	    END;

	    V_FLD_VAL :=
	       I.cid_clmn_nm || '!' || V_FLD_VAL || '!' || V_SCHEMA_NM;
	    EXIT;
	 END IF;
      END LOOP;

      RETURN V_FLD_VAL;
   EXCEPTION
      WHEN OTHERS
      THEN
	 RETURN NULL;
   END GET_cst_br_ONE_cid_VAL;
      PROCEDURE Crt_RemOwnr_new_addr_rcrd (P_addr_type	    NUMBER DEFAULT 1,
				    P_cst_br_code    VARCHAR2,
				    P_cntry_2_ltr    VARCHAR2)
   AS
      Sql_str	VARCHAR2 (8000);
      Cnt	NUMBER := 0;
   BEGIN
      IF P_cst_br_code IS NULL
      THEN
 Sql_str:=' INSERT
INTO Addr_lst_dtl
(Addr_cat, Addr_typ, Cid_code,
   Cid_sub_code, Cid_clmn_nm, Cst_br_code,
   Addr_sts, Rcrd_sq, Sys_clmn_val,
   Clmn_val, Clmn_val_f, Rtrn_clmn_val)
SELECT Addr_cat,
	Addr_typ,
       Cid_code,
       Cid_sub_code,Cid_clmn_nm,Cst_br_code,  Addr_sts, Rcrd_sq,  Sys_clmn_val,
   Clmn_val, Clmn_val_f,Rtrn_clmn_val
FROM(
SELECT 5 Addr_cat,
       1 Addr_typ,
       UPPER(Cid_code)Cid_code,
       Cid_sub_code,
       UPPER(s_Cid_list_dtl.Cid_clmn_nm)Cid_clmn_nm,
       to_char ( OWNR_NO ) Cst_br_code
  FROM s_Cid_list_dtl,s_Cid_list_dtl_actv, REM_OWNRS
 WHERE	   UPPER (Clmn_nm)  IN( UPPER (''ADDR_LST''),UPPER(''CNTCT_INFO''))
    AND UPPER(s_Cid_list_dtl.Cid_clmn_nm)=UPPER(s_Cid_list_dtl_ACTV.Cid_clmn_nm)
	      AND s_Cid_list_dtl_actv.Cntry_2_ltr_code=NVL(:P_cntry_2_ltr,''A'' )
	      AND s_Cid_list_dtl_actv.Cust_actv > 0
MINUS
SELECT Addr_cat,
       Addr_typ,
	UPPER(Cid_code)Cid_code,
       Cid_sub_code,
       UPPER(Cid_clmn_nm)Cid_clmn_nm,
       UPPER(Cst_br_code) Cst_br_code
  FROM Addr_lst_dtl
 WHERE Addr_cat = 5 AND Addr_typ = 1 )
 MODEL
 REFERENCE   ownr_cntry ON(
 SELECT to_char(OWNR_NO) OWNR_NO,C.Cntry_no Cntry_no,C.Cntry_2_ltr_code,NVL(C.Cntry_shrt,C.Cntry_a_name)Cntry_shrt,NVL(C.Cntry_shrt_f,C.Cntry_e_name)Cntry_shrt_f FROM REM_OWNRS R, Cntry C
 WHERE R.Cntry_no=C.Cntry_no
 )DIMENSION BY(   OWNR_NO )
 MEASURES( Cntry_no,Cntry_shrt,Cntry_shrt_f,Cntry_2_ltr_code)
 REFERENCE  ownr_prov ON(
 SELECT to_char(OWNR_NO) OWNR_NO,Mst.Prov_no ,NVL(Dtl.Prov_shrt,Dtl.Prov_a_name)Prov_shrt,NVL(Dtl.Prov_shrt_f,Dtl.Prov_e_name)Prov_shrt_f FROM REM_OWNRS Mst, Ias_provinces Dtl
 WHERE Mst.Prov_no IS NOT NULL AND Mst.Cntry_no=NVL(Dtl.Cntry_no,Mst.Cntry_no)
 AND Mst.Prov_no=Dtl.Prov_no
 )DIMENSION BY( OWNR_NO )
 MEASURES( Prov_no,Prov_shrt,Prov_shrt_f)
 REFERENCE   ownr_city ON(
 SELECT to_char(OWNR_NO) OWNR_NO,Mst.City_no ,NVL(Dtl.City_shrt,Dtl.City_a_name)City_shrt,NVL(Dtl.City_shrt_f,Dtl.City_e_name)City_shrt_f FROM REM_OWNRS Mst, Cities Dtl
 WHERE Mst.City_no IS NOT NULL AND Mst.Cntry_no=NVL(Dtl.Cntry_no,Mst.Cntry_no)
 AND Mst.Prov_no=NVL(Dtl.Prov_no,Mst.Prov_no)
 AND Mst. City_no=Dtl.City_no
 )DIMENSION BY( OWNR_NO )
 MEASURES( City_no,City_shrt,City_shrt_f)
 REFERENCE   ownr_rgn ON(
 SELECT to_char(OWNR_NO) OWNR_NO,Mst.R_code ,NVL(Dtl.Rgn_shrt,Dtl.R_a_name)Rgn_shrt,NVL(Dtl.Rgn_shrt_f,Dtl.R_e_name)Rgn_shrt_f FROM REM_OWNRS Mst, Regions Dtl
 WHERE Mst.R_code IS NOT NULL AND Mst.Cntry_no=NVL(Dtl.Cntry_no,Mst.Cntry_no)
 AND Mst.Prov_no=NVL(Dtl.Prov_no,Mst.Prov_no)
 AND Mst. City_no=NVL(Dtl.City_no,Mst.City_no)
 AND Mst.R_code=Dtl.R_code
 )DIMENSION BY( OWNR_NO )
 MEASURES( R_code,Rgn_shrt,Rgn_shrt_f)
  REFERENCE   Ownr_addr ON(
SELECT to_char(OWNR_NO) OWNR_NO,
       SUBSTR (ADDRS, 1, 50) ADDRS,
       SUBSTR (OWNR_L_NM, 1, 50) OWNR_L_NM,
       SUBSTR (OWNR_F_NM, 1, 50) OWNR_F_NM,
       SUBSTR (E_MAIL, 1, 50) E_MAIL,
       SUBSTR (WEB_SITE, 1, 50) WEB_SITE,
       SUBSTR (FAX_NO, 1, 50) FAX_NO,
       SUBSTR (TEL_NO, 1, 50) TEL_NO,
       SUBSTR (POST_CODE, 1, 50) POST_CODE,
       SUBSTR (MOBILE_NO, 1, 50) MOBILE_NO,
       SUBSTR (PO_BOX_NO, 1, 50) PO_BOX_NO
  FROM REM_OWNRS
 )DIMENSION BY( OWNR_NO )
 MEASURES( ADDRS,OWNR_L_NM,OWNR_F_NM,E_MAIL,WEB_SITE,FAX_NO,TEL_NO,POST_CODE,MOBILE_NO,PO_BOX_NO)
 DIMENSION BY(Cid_clmn_nm,Cst_br_code)
 MEASURES( Addr_cat,
	Addr_typ,
       Cid_code,
       Cid_sub_code, 1 Addr_sts, 1 Rcrd_sq, CAST(NULL AS VARCHAR2(30)) Sys_clmn_val,
   CAST(NULL AS VARCHAR2(50))Clmn_val,CAST(NULL AS VARCHAR2(50)) Clmn_val_f,CAST(NULL AS VARCHAR2(20)) Rtrn_clmn_val)
   RULES(
	Sys_clmn_val[''COUNTRY'',ANY]=Ownr_cntry.Cntry_no[CV(Cst_br_code)],
	Clmn_val[''COUNTRY'',ANY]=Ownr_cntry.Cntry_shrt[CV(Cst_br_code)],
	Clmn_val_f[''COUNTRY'',ANY]=Ownr_cntry.Cntry_shrt_f[CV(Cst_br_code)],
	Rtrn_clmn_val[''COUNTRY'',ANY]=Ownr_cntry.Cntry_2_ltr_code[CV(Cst_br_code)],
	--------------REGION  PROV
	    Sys_clmn_val[''REGION'',ANY]=Ownr_prov.Prov_no[CV(Cst_br_code)],
	Clmn_val[''REGION'',ANY]=Ownr_prov.Prov_shrt[CV(Cst_br_code)],
	Clmn_val_f[''REGION'',ANY]=Ownr_prov.Prov_shrt_f[CV(Cst_br_code)],
	------------SETTLEMENT CITIES
	    Sys_clmn_val[''SETTLEMENT'',ANY]=Ownr_city.City_no[CV(Cst_br_code)],
	Clmn_val[''SETTLEMENT'',ANY]=Ownr_city.City_shrt[CV(Cst_br_code)],
	Clmn_val_f[''SETTLEMENT'',ANY]=Ownr_city.City_shrt_f[CV(Cst_br_code)],
	----------------------MUNICIPALITY REGIONS
	    Sys_clmn_val[''MUNICIPALITY'',ANY]=Ownr_rgn.R_code[CV(Cst_br_code)],
	Clmn_val[''MUNICIPALITY'',ANY]=Ownr_rgn.Rgn_shrt[CV(Cst_br_code)],
	Clmn_val_f[''MUNICIPALITY'',ANY]=Ownr_rgn.Rgn_shrt_f[CV(Cst_br_code)],
	-------- STREETNAME ADDRS
	Clmn_val[''STREETNAME'',ANY]=Ownr_addr.ADDRS[CV(Cst_br_code)],

	------POSTALCODE  POST_CODE
	 Clmn_val[''POSTALCODE'',ANY]=Ownr_addr.POST_CODE[CV(Cst_br_code)],
	-------  POBOX PO_BOX_NO
	 Clmn_val[''POBOX'',ANY]=Ownr_addr.PO_BOX_NO[CV(Cst_br_code)],
		  ----- OWNR_L_NM,--COMR_NAME
	   Clmn_val[''COMR_NAME'',ANY]=Ownr_addr.OWNR_L_NM[CV(Cst_br_code)],
	     Clmn_val_F[''COMR_NAME'',ANY]=Ownr_addr.OWNR_f_NM[CV(Cst_br_code)],
	   ---- TEL_NO,--LND_PH_NO
	   Clmn_val[''LND_PH_NO'',ANY]=Ownr_addr.TEL_NO[CV(Cst_br_code)],
	--FAX_NO,      --LND_PH_NO1
	Clmn_val[''LND_PH_NO1'',ANY]=Ownr_addr.FAX_NO[CV(Cst_br_code)],
	---OWNR_L_NM,--PRSN_NAME
	Clmn_val[''PRSN_NAME'',ANY]=Ownr_addr.OWNR_L_NM[CV(Cst_br_code)],
	--  E_MAIL, --EMAIL_ADDR
	Clmn_val[''EMAIL_ADDR'',ANY]=Ownr_addr.E_MAIL[CV(Cst_br_code)],
	--WEB_SITE,  --WEB_ST_ADDR
	Clmn_val[''WEB_ST_ADDR'',ANY]=Ownr_addr.WEB_SITE[CV(Cst_br_code)],
	-- MOBILE_NO --MOB_PH_NO
	Clmn_val[''MOB_PH_NO'',ANY]=Ownr_addr.MOBILE_NO[CV(Cst_br_code)]
   )' ;
   execute immediate Sql_str using P_cntry_2_ltr;

      ELSE
	 INSERT INTO Addr_lst_dtl (Addr_cat,
				   Addr_typ,
				   Cid_code,
				   Cid_sub_code,
				   Cid_clmn_nm,
				   Cst_br_code,
				   Addr_sts,
				   Rcrd_sq)
	    SELECT Addr_cat,
		   Addr_typ,
		   Cid_code,
		   Cid_sub_code,
		   Cid_clmn_nm,
		   Cst_br_code,
		   1 Addr_sts,
		   1 Rcrd_sq
	      FROM (SELECT 5 Addr_cat,
			   NVL (P_addr_type, 1) Addr_typ,
			   UPPER (Cid_code) Cid_code,
			   Cid_sub_code,
			   UPPER (s_Cid_list_dtl.Cid_clmn_nm) Cid_clmn_nm,
			   UPPER (P_cst_br_code) Cst_br_code
		      FROM s_Cid_list_dtl, s_Cid_list_dtl_actv
		     WHERE     UPPER (Clmn_nm) IN (UPPER ('ADDR_LST'),
						   UPPER ('CNTCT_INFO'))
			   AND UPPER (s_Cid_list_dtl.Cid_clmn_nm) =
				  UPPER (s_Cid_list_dtl_ACTV.Cid_clmn_nm)
			   AND s_Cid_list_dtl_actv.Cntry_2_ltr_code =
				  NVL (P_cntry_2_ltr, 'A')
			   AND s_Cid_list_dtl_actv.Cust_actv > 0
		    MINUS
		    SELECT Addr_cat,
			   Addr_typ,
			   UPPER (Cid_code) Cid_code,
			   Cid_sub_code,
			   UPPER (Cid_clmn_nm) Cid_clmn_nm,
			   UPPER (Cst_br_code) Cst_br_code
		      FROM Addr_lst_dtl
		     WHERE     Addr_cat = 5
			   AND Addr_typ = NVL (P_addr_type, 1)
			   AND UPPER (Cst_br_code) = UPPER (P_cst_br_code));
      END IF;
   END Crt_RemOwnr_new_addr_rcrd;
--=============================================================================================================================--
PROCEDURE Crt_RemOwnr_new_CID_rcrd (P_cst_br_code    VARCHAR2,
				      P_cntry_2_ltr    VARCHAR2)
   AS
   Sql_str   VARCHAR2 (8000);
   BEGIN
 Sql_str:='
	 INSERT
INTO INPT_CID_lst_dtl
(CID_cat, Cid_code,
   Cid_sub_code, Cid_clmn_nm, Cst_br_code,
   CID_STS, Rcrd_sq)
SELECT CID_cat,
       Cid_code,
       Cid_sub_code,Cid_clmn_nm,Cst_br_code, 1	CID_STS,    1 Rcrd_sq
FROM(
SELECT 5 CID_CAT,
       UPPER(Cid_code)Cid_code,
       Cid_sub_code,
       UPPER(s_Cid_list_dtl.Cid_clmn_nm)Cid_clmn_nm,
       UPPER(ownr_no) Cst_br_code
      FROM s_Cid_list_dtl,s_Cid_list_dtl_actv, rem_ownrs
	WHERE	  UPPER (Clmn_nm) = UPPER (''OTH_ICD_LST'')
	AND UPPER(s_Cid_list_dtl.Cid_clmn_nm)=UPPER(s_Cid_list_dtl_ACTV.Cid_clmn_nm)
		  AND s_Cid_list_dtl_actv.Cntry_2_ltr_code=NVL( P_cntry_2_ltr,''A'' )
		  AND s_Cid_list_dtl_actv.Cust_actv > 0)';

  execute immediate Sql_str using P_cntry_2_ltr;

END Crt_RemOwnr_new_CID_rcrd;

PROCEDURE Crt_Vnd_new_CID_rcrd (P_cst_br_code	 VARCHAR2,
				   P_cntry_2_ltr    VARCHAR2)
   AS
   BEGIN
      IF P_cst_br_code IS NULL
      THEN
  INSERT
INTO INPT_CID_lst_dtl
(CID_cat, Cid_code,
   Cid_sub_code, Cid_clmn_nm, Cst_br_code,
   CID_STS, Rcrd_sq, Clmn_val)
SELECT CID_cat,
       Cid_code,
       Cid_sub_code,Cid_clmn_nm,Cst_br_code,  CID_STS, Rcrd_sq,Clmn_val
FROM(
SELECT 2 CID_CAT,
       UPPER(Cid_code)Cid_code,
       Cid_sub_code,
       UPPER(s_Cid_list_dtl.Cid_clmn_nm)Cid_clmn_nm,
       UPPER(V_code) Cst_br_code
      FROM s_Cid_list_dtl,s_Cid_list_dtl_actv, V_Details
	WHERE	  UPPER (Clmn_nm) = UPPER ('OTH_ICD_LST')
	AND UPPER(s_Cid_list_dtl.Cid_clmn_nm)=UPPER(s_Cid_list_dtl_ACTV.Cid_clmn_nm)
		  AND s_Cid_list_dtl_actv.Cntry_2_ltr_code=NVL( P_cntry_2_ltr,'A' )
		  AND s_Cid_list_dtl_actv.Cust_actv > 0
MINUS
SELECT CID_cat,
	UPPER(Cid_code)Cid_code,
       Cid_sub_code,
       UPPER(Cid_clmn_nm)Cid_clmn_nm,
       UPPER(Cst_br_code) Cst_br_code
  FROM INPT_CID_lst_dtl
 WHERE CID_cat = 2 )
 MODEL
   REFERENCE   Cst_addr ON(
 SELECT V_code, V_TAX_CODE,CR_NO CRN_NO,NIS_NO,NAI_DSC,EQ_CPTL,VND_GCC FROM V_Details
 )DIMENSION BY(V_code)
 MEASURES( V_TAX_CODE,CRN_NO,NIS_NO,NAI_DSC,EQ_CPTL,VND_GCC)
 DIMENSION BY(Cid_clmn_nm,Cst_br_code)
 MEASURES( CID_cat,Cid_code,  Cid_sub_code, 1 CID_STS, 1 Rcrd_sq,   CAST(NULL AS VARCHAR2(50))Clmn_val)
   RULES(
	-- C_TAX_CODE --VAT_NO
	Clmn_val['VAT_NO',ANY]=Cst_addr.V_TAX_CODE[CV(Cst_br_code)],
	--CRN_NO   CRN_NO
	Clmn_val['CRN_NO',ANY]=Cst_addr.CRN_NO[CV(Cst_br_code)],
	--NAI_DSC TAX_SUB_CODE
	Clmn_val['TAX_SUB_CODE',ANY]=Cst_addr.NAI_DSC[CV(Cst_br_code)],
	--CST_GCC  GCC_NO
	Clmn_val['GCC_NO',ANY]=Cst_addr.VND_GCC[CV(Cst_br_code)],
	 --EQ_CPTL  CAPITAL
	Clmn_val['CAPITAL',ANY]=Cst_addr.EQ_CPTL[CV(Cst_br_code)],
	 --NIS_NO  NIS_CODE
	Clmn_val['NIS_CODE',ANY]=Cst_addr.NIS_NO[CV(Cst_br_code)]
   );
      ELSE
	 INSERT INTO INPT_CID_lst_dtl (CID_cat,
				       Cid_code,
				       Cid_sub_code,
				       Cid_clmn_nm,
				       Cst_br_code,
				       CID_STS,
				       Rcrd_sq)
	    SELECT CID_cat,
		   Cid_code,
		   Cid_sub_code,
		   Cid_clmn_nm,
		   Cst_br_code,
		   1 CID_STS,
		   1 Rcrd_sq
	      FROM (SELECT 2 CID_CAT,
			   UPPER (Cid_code) Cid_code,
			   Cid_sub_code,
			   UPPER (s_Cid_list_dtl.Cid_clmn_nm) Cid_clmn_nm,
			   UPPER (P_cst_br_code) Cst_br_code
		      FROM s_Cid_list_dtl, s_Cid_list_dtl_actv
		     WHERE     UPPER (Clmn_nm) = UPPER ('OTH_ICD_LST')
			   AND UPPER (s_Cid_list_dtl.Cid_clmn_nm) =
				  UPPER (s_Cid_list_dtl_ACTV.Cid_clmn_nm)
			   AND s_Cid_list_dtl_actv.Cntry_2_ltr_code =
				  NVL (P_cntry_2_ltr, 'A')
			   AND s_Cid_list_dtl_actv.Cust_actv > 0
		    MINUS
		    SELECT CID_cat,
			   UPPER (Cid_code) Cid_code,
			   Cid_sub_code,
			   UPPER (Cid_clmn_nm) Cid_clmn_nm,
			   UPPER (Cst_br_code) Cst_br_code
		      FROM INPT_CID_lst_dtl
		     WHERE     CID_cat = 2
			   AND UPPER (Cst_br_code) = UPPER (P_cst_br_code));
      END IF;
END Crt_Vnd_new_CID_rcrd;

PROCEDURE Crt_VNDR_new_addr_rcrd (P_addr_type	   NUMBER DEFAULT 2,
				    P_cst_br_code    VARCHAR2,
				    P_cntry_2_ltr    VARCHAR2)
   AS
      Sql_str	VARCHAR2 (4000);
      Cnt	NUMBER := 0;
   BEGIN
      IF P_cst_br_code IS NULL
      THEN
  INSERT
INTO Addr_lst_dtl
(Addr_cat, Addr_typ, Cid_code,
   Cid_sub_code, Cid_clmn_nm, Cst_br_code,
   Addr_sts, Rcrd_sq, Sys_clmn_val,
   Clmn_val, Clmn_val_f, Rtrn_clmn_val)
SELECT Addr_cat,
       Addr_typ,
       Cid_code,
       Cid_sub_code,
       Cid_clmn_nm,
       Cst_br_code,
       Addr_sts,
       Rcrd_sq,
       Sys_clmn_val,
       Clmn_val,
       Clmn_val_f,
       Rtrn_clmn_val
  FROM (SELECT 3				      Addr_cat,
	       1				      Addr_typ,
	       UPPER (Cid_code) 		      Cid_code,
	       Cid_sub_code,
	       UPPER (s_Cid_list_dtl.Cid_clmn_nm)     Cid_clmn_nm,
	       UPPER (V_code)			      Cst_br_code
	  FROM s_Cid_list_dtl, s_Cid_list_dtl_actv, v_dETAILS
	 WHERE	   UPPER (Clmn_nm) IN
		       (UPPER ('ADDR_LST'), UPPER ('CNTCT_INFO'))
	       AND UPPER (s_Cid_list_dtl.Cid_clmn_nm) =
		   UPPER (s_Cid_list_dtl_ACTV.Cid_clmn_nm)
	       AND s_Cid_list_dtl_actv.Cntry_2_ltr_code =
		   NVL (P_cntry_2_ltr, 'A')
	       AND s_Cid_list_dtl_actv.Cust_actv > 0
	MINUS
	SELECT Addr_cat,
	       Addr_typ,
	       UPPER (Cid_code)        Cid_code,
	       Cid_sub_code,
	       UPPER (Cid_clmn_nm)     Cid_clmn_nm,
	       UPPER (Cst_br_code)     Cst_br_code
	  FROM Addr_lst_dtl
	 WHERE Addr_cat = 3 AND Addr_typ = 1)
MODEL
    REFERENCE Cst_cntry ON
    (
	SELECT V_code,
	       C.Cntry_no				Cntry_no,
	       C.Cntry_2_ltr_code,
	       NVL (C.Cntry_shrt, C.Cntry_a_name)	Cntry_shrt,
	       NVL (C.Cntry_shrt_f, C.Cntry_e_name)	Cntry_shrt_f
	  FROM V_DETAILS R, Cntry C
	 WHERE R.Cntry_no = C.Cntry_no
    )
	DIMENSION BY (V_code)
	MEASURES (Cntry_no,
		  Cntry_shrt,
		  Cntry_shrt_f,
		  Cntry_2_ltr_code)
    REFERENCE Cst_prov ON
    (
	SELECT V_code,
	       Mst.Prov_no,
	       NVL (Dtl.Prov_shrt, Dtl.Prov_a_name)	  Prov_shrt,
	       NVL (Dtl.Prov_shrt_f, Dtl.Prov_e_name)	  Prov_shrt_f
	  FROM V_DETAILS Mst, Ias_provinces Dtl
	 WHERE	   Mst.Prov_no IS NOT NULL
	       AND Mst.Cntry_no = NVL (Dtl.Cntry_no, Mst.Cntry_no)
	       AND Mst.Prov_no = Dtl.Prov_no
    )
	DIMENSION BY (V_code)
	MEASURES (Prov_no, Prov_shrt, Prov_shrt_f)
    REFERENCE Cst_city ON
    (
	SELECT V_code,
	       Mst.City_no,
	       NVL (Dtl.City_shrt, Dtl.City_a_name)	  City_shrt,
	       NVL (Dtl.City_shrt_f, Dtl.City_e_name)	  City_shrt_f
	  FROM V_DETAILS Mst, Cities Dtl
	 WHERE	   Mst.City_no IS NOT NULL
	       AND Mst.Cntry_no = NVL (Dtl.Cntry_no, Mst.Cntry_no)
	       AND Mst.Prov_no = NVL (Dtl.Prov_no, Mst.Prov_no)
	       AND Mst.City_no = Dtl.City_no
    )
	DIMENSION BY (V_code)
	MEASURES (City_no, City_shrt, City_shrt_f)
    REFERENCE Cst_addr ON
    (
	SELECT V_code,
	       SUBSTR (V_address, 1, 50)	 Street,
	       V_box,
	       SUBSTR (Gln_code, 1, INSTR (Gln_code, ','))     Longitude,
	       SUBSTR (Gln_code, INSTR (Gln_code, ','))        Latitude,
	       SUBSTR (V_A_NAME, 1, 50) 		       V_A_NAME,
	       SUBSTR (V_E_NAME, 1, 50) 		       V_E_NAME,
	       SUBSTR (V_PHONE, 1, 50)			       V_PHONE,
	       SUBSTR (V_FAX, 1, 50)			       V_FAX,
	       SUBSTR (V_PERSON, 1, 50) 		       V_PERSON,
	       SUBSTR (V_E_MAIL, 1, 50) 		       V_E_MAIL,
	       SUBSTR (V_WEB_SITE, 1, 50)		       V_WEB_SITE,
	       SUBSTR (V_MOBILE, 1, 50) 		       V_MOBILE
	  FROM V_DETAILS
    )
	DIMENSION BY (V_code)
	MEASURES (Street,
		  V_box,
		  Longitude,
		  Latitude,
		  V_A_NAME,
		  V_E_NAME,
		  V_PHONE,
		  V_FAX,
		  V_PERSON,
		  V_E_MAIL,
		  V_WEB_SITE,
		  V_MOBILE)
    DIMENSION BY (Cid_clmn_nm, Cst_br_code)
    MEASURES (Addr_cat,
	      Addr_typ,
	      Cid_code,
	      Cid_sub_code,
	      1 Addr_sts,
	      1 Rcrd_sq,
	      CAST (NULL AS VARCHAR2 (30)) Sys_clmn_val,
	      CAST (NULL AS VARCHAR2 (50)) Clmn_val,
	      CAST (NULL AS VARCHAR2 (50)) Clmn_val_f,
	      CAST (NULL AS VARCHAR2 (20)) Rtrn_clmn_val)
    RULES
    (
	Sys_clmn_val ['COUNTRY', ANY] = Cst_cntry.Cntry_no[CV (Cst_br_code)],
	Clmn_val ['COUNTRY', ANY] = Cst_cntry.Cntry_shrt[CV (Cst_br_code)],
	Clmn_val_f ['COUNTRY', ANY] =
	    Cst_cntry.Cntry_shrt_f[CV (Cst_br_code)],
	Rtrn_clmn_val ['COUNTRY', ANY] =
	    Cst_cntry.Cntry_2_ltr_code[CV (Cst_br_code)],
	--------------REGION  PROV
	Sys_clmn_val ['REGION', ANY] = Cst_prov.Prov_no[CV (Cst_br_code)],
	Clmn_val ['REGION', ANY] = Cst_prov.Prov_shrt[CV (Cst_br_code)],
	Clmn_val_f ['REGION', ANY] = Cst_prov.Prov_shrt_f[CV (Cst_br_code)],
	------------SETTLEMENT CITIES
	Sys_clmn_val ['SETTLEMENT', ANY] = Cst_city.City_no[CV (Cst_br_code)],
	Clmn_val ['SETTLEMENT', ANY] = Cst_city.City_shrt[CV (Cst_br_code)],
	Clmn_val_f ['SETTLEMENT', ANY] =
	    Cst_city.City_shrt_f[CV (Cst_br_code)],
	Clmn_val ['STREETNAME', ANY] = Cst_addr.Street[CV (Cst_br_code)],
	------- HOUSENUMBER BUILDING_NO
	Clmn_val ['LONGITUDE', ANY] = Cst_addr.Longitude[CV (Cst_br_code)],
	Clmn_val ['LATITUDE', ANY] = Cst_addr.Latitude[CV (Cst_br_code)],
	----- C_NAME,--COMR_NAME
	Clmn_val ['COMR_NAME', ANY] = Cst_addr.V_A_NAME[CV (Cst_br_code)],
	Clmn_val_F ['COMR_NAME', ANY] = Cst_addr.V_E_NAME[CV (Cst_br_code)],
	---- C_PHONE,--LND_PH_NO
	Clmn_val ['LND_PH_NO', ANY] = Cst_addr.V_PHONE[CV (Cst_br_code)],
	--C_FAX,      --LND_PH_NO1
	Clmn_val ['LND_PH_NO1', ANY] = Cst_addr.V_FAX[CV (Cst_br_code)],
	---C_PERSON,--PRSN_NAME
	Clmn_val ['PRSN_NAME', ANY] = Cst_addr.V_PERSON[CV (Cst_br_code)],
	--  C_E_MAIL, --EMAIL_ADDR
	Clmn_val ['EMAIL_ADDR', ANY] = Cst_addr.V_E_MAIL[CV (Cst_br_code)],
	--C_WEB_SITE,  --WEB_ST_ADDR
	Clmn_val ['WEB_ST_ADDR', ANY] = Cst_addr.V_WEB_SITE[CV (Cst_br_code)],
	-- C_MOBILE --MOB_PH_NO
	Clmn_val ['MOB_PH_NO', ANY] = Cst_addr.V_MOBILE[CV (Cst_br_code)]);
      ELSE
	 INSERT INTO Addr_lst_dtl (Addr_cat,
				   Addr_typ,
				   Cid_code,
				   Cid_sub_code,
				   Cid_clmn_nm,
				   Cst_br_code,
				   Addr_sts,
				   Rcrd_sq)
	    SELECT Addr_cat,
		   Addr_typ,
		   Cid_code,
		   Cid_sub_code,
		   Cid_clmn_nm,
		   Cst_br_code,
		   1 Addr_sts,
		   1 Rcrd_sq
	      FROM (SELECT 3 Addr_cat,
			   NVL (P_addr_type, 1) Addr_typ,
			   UPPER (Cid_code) Cid_code,
			   Cid_sub_code,
			   UPPER (s_Cid_list_dtl.Cid_clmn_nm) Cid_clmn_nm,
			   UPPER (P_cst_br_code) Cst_br_code
		      FROM s_Cid_list_dtl, s_Cid_list_dtl_actv
		     WHERE     UPPER (Clmn_nm) IN (UPPER ('ADDR_LST'),
						   UPPER ('CNTCT_INFO'))
			   AND UPPER (s_Cid_list_dtl.Cid_clmn_nm) =
				  UPPER (s_Cid_list_dtl_ACTV.Cid_clmn_nm)
			   AND s_Cid_list_dtl_actv.Cntry_2_ltr_code =
				  NVL (P_cntry_2_ltr, 'A')
			   AND s_Cid_list_dtl_actv.Cust_actv > 0
		    MINUS
		    SELECT Addr_cat,
			   Addr_typ,
			   UPPER (Cid_code) Cid_code,
			   Cid_sub_code,
			   UPPER (Cid_clmn_nm) Cid_clmn_nm,
			   UPPER (Cst_br_code) Cst_br_code
		      FROM Addr_lst_dtl
		     WHERE     Addr_cat = 3
			   AND Addr_typ = NVL (P_addr_type, 1)
			   AND UPPER (Cst_br_code) = UPPER (P_cst_br_code));
      END IF;
 END Crt_VNDR_new_addr_rcrd;
END Cid_addr_op_pkg;
/

-- =============================================
-- PACKAGE SPEC: GNR_E_INVC_OP  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE Gnr_e_invc_op AS
   FUNCTION get_e_invc_trns_desc (P_main_invc_note_typ	  NUMBER,
				  P_SUB_invc_note_typ	  NUMBER,
				  p_cntry_2_ltr 	  VARCHAR2,
				  p_lang_code		  VARCHAR2,
				  p_lang_id		  NUMBER DEFAULT 1,
				  p_SPSFC_TYP		  NUMBER,
				  p_invc_trns_code	  NUMBER,
				  p_SYS_DOC_TYPE	  NUMBER DEFAULT 4)
      RETURN VARCHAR2;

   FUNCTION get_e_invc_trns_code (p_cntry_2_ltr       VARCHAR2,
				  p_SPSFC_TYP	      NUMBER,
				  p_invc_trns_code    NUMBER,
				  p_SYS_DOC_TYPE      NUMBER DEFAULT 4)
      RETURN VARCHAR2;

   FUNCTION chk_e_invc_type (p_cntry_2_ltr	 VARCHAR2,
			     p_SPSFC_TYP	 NUMBER,
			     p_invc_trns_code	 NUMBER,
			     p_SYS_DOC_TYPE	 NUMBER DEFAULT 4,
			     p_invc_note_type	 NUMBER)
      RETURN BOOLEAN;

   FUNCTION is_export (p_cntry_2_ltr	   VARCHAR2,
		       p_SPSFC_TYP	   NUMBER,
		       p_invc_trns_code    NUMBER,
		       p_SYS_DOC_TYPE	   NUMBER DEFAULT 4)
      RETURN NUMBER;

   FUNCTION is_simplified (p_cntry_2_ltr       VARCHAR2,
			   p_SPSFC_TYP	       NUMBER,
			   p_invc_trns_code    NUMBER,
			   p_SYS_DOC_TYPE      NUMBER DEFAULT 4)
      RETURN NUMBER;

   FUNCTION is_taxinvoice (p_cntry_2_ltr       VARCHAR2,
			   p_SPSFC_TYP	       NUMBER,
			   p_invc_trns_code    NUMBER,
			   p_SYS_DOC_TYPE      NUMBER DEFAULT 4)
      RETURN NUMBER;

   FUNCTION is_nominal (p_cntry_2_ltr	    VARCHAR2,
			p_SPSFC_TYP	    NUMBER,
			p_invc_trns_code    NUMBER,
			p_SYS_DOC_TYPE	    NUMBER DEFAULT 4)
      RETURN NUMBER;

   FUNCTION is_summery (p_cntry_2_ltr	    VARCHAR2,
			p_SPSFC_TYP	    NUMBER,
			p_invc_trns_code    NUMBER,
			p_SYS_DOC_TYPE	    NUMBER DEFAULT 4)
      RETURN NUMBER;

   FUNCTION is_third_party (p_cntry_2_ltr	VARCHAR2,
			    p_SPSFC_TYP 	NUMBER,
			    p_invc_trns_code	NUMBER,
			    p_SYS_DOC_TYPE	NUMBER DEFAULT 4)
      RETURN NUMBER;

   FUNCTION is_self_billed (p_cntry_2_ltr	VARCHAR2,
			    p_SPSFC_TYP 	NUMBER,
			    p_invc_trns_code	NUMBER,
			    p_SYS_DOC_TYPE	NUMBER DEFAULT 4)
      RETURN NUMBER;

   FUNCTION CHK_TAX_CAT_RSN (P_TAX_CAT_CODE	   VARCHAR2,
			     P_CNTRY_2_LTR_CODE    VARCHAR2)
      RETURN NUMBER;

   FUNCTION GET_TAX_CLC_CAT_CODE (P_TAX_CLC_TYP_NO	NUMBER,
				  P_CNTRY_2_LTR_CODE	VARCHAR2)
      RETURN VARCHAR2;

   FUNCTION GET_ITM_VAT_CAT_CODE (P_ITM_VAT_TYP 	NUMBER,
				  P_CNTRY_2_LTR_CODE	VARCHAR2)
      RETURN VARCHAR2;

   FUNCTION get_cntry_code_by_cmp (p_cmp_no NUMBER, P_TYPE NUMBER DEFAULT 0)
      RETURN VARCHAR2;

   FUNCTION Get_Lang_Abrv (P_Lang_No VARCHAR2)
      RETURN VARCHAR2;

   FUNCTION Get_Cmp_No_By_Tax (P_Tax_No NUMBER)
      RETURN NUMBER;

   FUNCTION Get_Cntry_Code_By_Tax (P_Tax_No NUMBER)
      RETURN VARCHAR2;

   FUNCTION Get_Cntry_Code_By_Clc_Mthd (P_Clc_Tax_No NUMBER)
      RETURN VARCHAR2;

   FUNCTION Get_Tax_Code (P_Tax_No NUMBER)
      RETURN VARCHAR2;

   FUNCTION GET_ITM_VAT_CAT_rate (P_VAT_CAT_CODE	VARCHAR2,
				  P_CNTRY_2_LTR_CODE	VARCHAR2)
      RETURN NUMBER;

   FUNCTION CHK_ITM_VAT_RATE_CHNG (P_VAT_CAT_CODE	 VARCHAR2,
				   P_CNTRY_2_LTR_CODE	 VARCHAR2)
      RETURN NUMBER;

   FUNCTION Get_Lang_DFLT
      RETURN NUMBER;

   FUNCTION get_e_invc_main_type (p_cntry_2_ltr       VARCHAR2,
				  p_SPSFC_TYP	      NUMBER,
				  p_invc_note_type    NUMBER,
				  p_SYS_DOC_TYPE      NUMBER DEFAULT 4)
      RETURN NUMBER;

   FUNCTION get_e_invc_pay_mns_code (P_BRN_NO	      s_brn.brn_no%TYPE,
				     p_doc_type       NUMBER,
				     p_e_INVC_CODE    NUMBER,
				     p_pay_mthd_no    NUMBER,
				     p_lang_id	      NUMBER,
				     p_type	      NUMBER)
      RETURN VARCHAR2;
END;
/

-- ---------------------------------------------
-- PACKAGE BODY: GNR_E_INVC_OP  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY Gnr_e_invc_op
AS
   FUNCTION get_e_invc_trns_desc (P_main_invc_note_typ	  NUMBER,
				  P_SUB_invc_note_typ	  NUMBER,
				  p_cntry_2_ltr 	  VARCHAR2,
				  p_lang_code		  VARCHAR2,
				  p_lang_id		  NUMBER DEFAULT 1,
				  p_SPSFC_TYP		  NUMBER,
				  p_invc_trns_code	  NUMBER,
				  p_SYS_DOC_TYPE	  NUMBER DEFAULT 4)
      RETURN VARCHAR2
   IS
      v_trns_txt   VARCHAR2 (2000);
   BEGIN
      SELECT LISTAGG (INVC_NOTE_NAME_LBL, ';')
		WITHIN GROUP (ORDER BY SUB_TRNS_POS, invc_note_ordr)
	INTO v_trns_txt
	FROM (SELECT lst.invc_note_type,
		     SUB_TRNS_POS,
		     invc_note_ordr,
		     cid_addr_op_pkg.get_trns_lbl (
			p_cntry_2_ltr	 => p_cntry_2_ltr,
			p_lang_code	 => p_lang_code,
			p_lang_id	 => p_lang_id,
			p_CID_NAME_LBL	 => INVC_NOTE_NAME_LBL)
			INVC_NOTE_NAME_LBL,
		     actv.invc_note_mn_actv,
		     actv.invc_note_sub_actv,
		     actv.main_invc_note_typ
		FROM s_invc_note_list lst, s_invc_note_actv actv
	       WHERE	 lst.invc_note_type = actv.invc_note_type
		     AND SPSFC_TYPe_id = p_SPSFC_TYP
		     AND NVL (SYS_DOC_TYPE, 0) = NVL (p_SYS_DOC_TYPE, 0)
		     AND UPPER (actv.cntry_2_ltr_code) =
			    UPPER (p_cntry_2_ltr)
		     AND (   actv.invc_note_mn_actv = 1
			  OR actv.invc_note_sub_actv = 1)
		     AND SHW_IN_SCR = 1
		     AND main_invc_note_typ =
			    NVL (P_main_invc_note_typ, main_invc_note_typ)
		     AND SUB_invc_note_typ =
			    NVL (P_SUB_invc_note_typ, SUB_invc_note_typ))
       WHERE BITAND (invc_note_ordr, p_invc_trns_code) = invc_note_ordr;

      RETURN v_trns_txt;
   EXCEPTION
      WHEN OTHERS
      THEN
	 RETURN NULL;
   END get_e_invc_trns_desc;

   FUNCTION get_e_invc_trns_code (p_cntry_2_ltr       VARCHAR2,
				  p_SPSFC_TYP	      NUMBER,
				  p_invc_trns_code    NUMBER,
				  p_SYS_DOC_TYPE      NUMBER DEFAULT 4)
      RETURN VARCHAR2
   IS
      v_trns_txt	     VARCHAR2 (15);
      v_invc_note_type	     NUMBER (3);
      v_SUB_invc_note_type   NUMBER := 0;
   BEGIN
      BEGIN
	 SELECT lst.invc_note_type
	   INTO v_invc_note_type
	   FROM s_invc_note_list lst, s_invc_note_actv actv
	  WHERE     lst.invc_note_type = actv.invc_note_type
		AND SPSFC_TYPe_id = p_SPSFC_TYP
		AND NVL (SYS_DOC_TYPE, 0) = NVL (p_SYS_DOC_TYPE, 0)
		AND UPPER (actv.cntry_2_ltr_code) = UPPER (p_cntry_2_ltr)
		AND actv.invc_note_mn_actv = 1
		AND BITAND (invc_note_ordr, NVL (p_invc_trns_code, 0)) =
		       invc_note_ordr;
      EXCEPTION
	 WHEN TOO_MANY_ROWS
	 THEN
	    raise_application_error (-20567,
				     'you must select one main type only ');
	 WHEN NO_DATA_FOUND
	 THEN
	    raise_application_error (-20567,
				     'you must select one main type ');
	 WHEN OTHERS
	 THEN
	    RETURN NULL;
      END;

      BEGIN
	 SELECT SUM (lst.invc_note_type)
	   INTO v_SUB_invc_note_type
	   FROM s_invc_note_list lst, s_invc_note_actv actv
	  WHERE     lst.invc_note_type = actv.invc_note_type
		AND SPSFC_TYPe_id = p_SPSFC_TYP
		AND NVL (SYS_DOC_TYPE, 0) = NVL (p_SYS_DOC_TYPE, 0)
		AND UPPER (actv.cntry_2_ltr_code) = UPPER (p_cntry_2_ltr)
		AND actv.invc_note_SUB_actv = 1
		AND SHW_IN_SCR = 0
		AND BITAND (invc_note_ordr, NVL (p_invc_trns_code, 0)) =
		       invc_note_ordr;

	 IF v_SUB_invc_note_type > 0
	 THEN
	    raise_application_error (-20567, 'ERROR IN YOUR SELECT ');
	 END IF;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    raise_application_error (-20567, 'ERROR IN YOUR SELECT ');
      END;

      BEGIN
	 IF	is_export (p_cntry_2_ltr      => p_cntry_2_ltr,
			   p_SPSFC_TYP	      => p_SPSFC_TYP,
			   p_invc_trns_code   => p_invc_trns_code,
			   p_SYS_DOC_TYPE     => p_SYS_DOC_TYPE) = 1
	    AND is_self_billed (p_cntry_2_ltr	   => p_cntry_2_ltr,
				p_SPSFC_TYP	   => p_SPSFC_TYP,
				p_invc_trns_code   => p_invc_trns_code,
				p_SYS_DOC_TYPE	   => p_SYS_DOC_TYPE) = 1
	 THEN
	    raise_application_error (-20567, 'ERROR IN YOUR SELECT ');
	 END IF;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    raise_application_error (-20567, 'ERROR IN YOUR SELECT ');
      END;

      BEGIN
	 SELECT LISTAGG (SUB_TRNS_val) WITHIN GROUP (ORDER BY SUB_TRNS_POS)
	   INTO v_trns_txt
	   FROM (SELECT lst.invc_note_type,
			SUB_TRNS_POS,
			CASE
			   WHEN BITAND (invc_note_ordr, p_invc_trns_code) =
				   invc_note_ordr
			   THEN
			      NVL (SUB_TRNS_val, '0')
			   ELSE
			      '0'
			END
			   SUB_TRNS_val,
			invc_note_ordr
		   FROM s_invc_note_list lst, s_invc_note_actv actv
		  WHERE     lst.invc_note_type = actv.invc_note_type
			AND SPSFC_TYPe_id = p_SPSFC_TYP
			AND NVL (SYS_DOC_TYPE, 0) = NVL (p_SYS_DOC_TYPE, 0)
			AND UPPER (actv.cntry_2_ltr_code) =
			       UPPER (p_cntry_2_ltr)
			AND (	(    actv.invc_note_mn_actv = 1
				 AND BITAND (invc_note_ordr,
					     p_invc_trns_code) =
					invc_note_ordr)
			     OR actv.invc_note_sub_actv = 1)
			AND SUB_TRNS_val IS NOT NULL
			AND NVL (SUB_TRNS_pos, 0) > 0);


	 RETURN v_trns_txt;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    IF NVL (p_SYS_DOC_TYPE, 0) <> 4
	    THEN
	       RETURN v_invc_note_type;
	    ELSE
	       RETURN NULL;
	    END IF;
      END;
   END get_e_invc_trns_code;

   FUNCTION chk_e_invc_type (p_cntry_2_ltr	 VARCHAR2,
			     p_SPSFC_TYP	 NUMBER,
			     p_invc_trns_code	 NUMBER,
			     p_SYS_DOC_TYPE	 NUMBER DEFAULT 4,
			     p_invc_note_type	 NUMBER)
      RETURN BOOLEAN
   IS
      v_invc_note_type	 NUMBER (3);
   BEGIN
      SELECT lst.invc_note_type
	INTO v_invc_note_type
	FROM s_invc_note_list lst, s_invc_note_actv actv
       WHERE	 lst.invc_note_type = actv.invc_note_type
	     AND SPSFC_TYPe_id = p_SPSFC_TYP
	     AND lst.invc_note_type = NVL (p_invc_note_type, 0)
	     AND NVL (SYS_DOC_TYPE, 0) = NVL (p_SYS_DOC_TYPE, 0)
	     AND UPPER (actv.cntry_2_ltr_code) = UPPER (p_cntry_2_ltr)
	     AND (actv.invc_note_mn_actv = 1 OR actv.invc_note_sub_actv = 1)
	     AND BITAND (invc_note_ordr, NVL (p_invc_trns_code, 0)) =
		    invc_note_ordr;

      RETURN TRUE;
   EXCEPTION
      WHEN OTHERS
      THEN
	 RETURN FALSE;
   END chk_e_invc_type;

   FUNCTION is_export (p_cntry_2_ltr	   VARCHAR2,
		       p_SPSFC_TYP	   NUMBER,
		       p_invc_trns_code    NUMBER,
		       p_SYS_DOC_TYPE	   NUMBER DEFAULT 4)
      RETURN NUMBER
   IS
   BEGIN
      RETURN CASE
		WHEN chk_e_invc_type (p_cntry_2_ltr	 => p_cntry_2_ltr,
				      p_SPSFC_TYP	 => p_SPSFC_TYP,
				      p_invc_trns_code	 => p_invc_trns_code,
				      p_SYS_DOC_TYPE	 => p_SYS_DOC_TYPE,
				      p_invc_note_type	 => 623)
		THEN
		   1
		ELSE
		   0
	     END;
   END is_export;

   FUNCTION is_simplified (p_cntry_2_ltr       VARCHAR2,
			   p_SPSFC_TYP	       NUMBER,
			   p_invc_trns_code    NUMBER,
			   p_SYS_DOC_TYPE      NUMBER DEFAULT 4)
      RETURN NUMBER
   IS
   BEGIN
      RETURN CASE
		WHEN chk_e_invc_type (p_cntry_2_ltr	 => p_cntry_2_ltr,
				      p_SPSFC_TYP	 => p_SPSFC_TYP,
				      p_invc_trns_code	 => p_invc_trns_code,
				      p_SYS_DOC_TYPE	 => p_SYS_DOC_TYPE,
				      p_invc_note_type	 => 202)
		THEN
		   1
		ELSE
		   0
	     END;
   END is_simplified;

   FUNCTION is_taxinvoice (p_cntry_2_ltr       VARCHAR2,
			   p_SPSFC_TYP	       NUMBER,
			   p_invc_trns_code    NUMBER,
			   p_SYS_DOC_TYPE      NUMBER DEFAULT 4)
      RETURN NUMBER
   IS
   BEGIN
      RETURN CASE
		WHEN chk_e_invc_type (p_cntry_2_ltr	 => p_cntry_2_ltr,
				      p_SPSFC_TYP	 => p_SPSFC_TYP,
				      p_invc_trns_code	 => p_invc_trns_code,
				      p_SYS_DOC_TYPE	 => p_SYS_DOC_TYPE,
				      p_invc_note_type	 => 388)
		THEN
		   1
		ELSE
		   0
	     END;
   END is_taxinvoice;

   FUNCTION is_nominal (p_cntry_2_ltr	    VARCHAR2,
			p_SPSFC_TYP	    NUMBER,
			p_invc_trns_code    NUMBER,
			p_SYS_DOC_TYPE	    NUMBER DEFAULT 4)
      RETURN NUMBER
   IS
   BEGIN
      RETURN CASE
		WHEN chk_e_invc_type (p_cntry_2_ltr	 => p_cntry_2_ltr,
				      p_SPSFC_TYP	 => p_SPSFC_TYP,
				      p_invc_trns_code	 => p_invc_trns_code,
				      p_SYS_DOC_TYPE	 => p_SYS_DOC_TYPE,
				      p_invc_note_type	 => 751)
		THEN
		   1
		ELSE
		   0
	     END;
   END is_nominal;

   FUNCTION is_summery (p_cntry_2_ltr	    VARCHAR2,
			p_SPSFC_TYP	    NUMBER,
			p_invc_trns_code    NUMBER,
			p_SYS_DOC_TYPE	    NUMBER DEFAULT 4)
      RETURN NUMBER
   IS
   BEGIN
      RETURN CASE
		WHEN chk_e_invc_type (p_cntry_2_ltr	 => p_cntry_2_ltr,
				      p_SPSFC_TYP	 => p_SPSFC_TYP,
				      p_invc_trns_code	 => p_invc_trns_code,
				      p_SYS_DOC_TYPE	 => p_SYS_DOC_TYPE,
				      p_invc_note_type	 => 385)
		THEN
		   1
		ELSE
		   0
	     END;
   END is_summery;

   FUNCTION is_third_party (p_cntry_2_ltr	VARCHAR2,
			    p_SPSFC_TYP 	NUMBER,
			    p_invc_trns_code	NUMBER,
			    p_SYS_DOC_TYPE	NUMBER DEFAULT 4)
      RETURN NUMBER
   IS
   BEGIN
      RETURN CASE
		WHEN chk_e_invc_type (p_cntry_2_ltr	 => p_cntry_2_ltr,
				      p_SPSFC_TYP	 => p_SPSFC_TYP,
				      p_invc_trns_code	 => p_invc_trns_code,
				      p_SYS_DOC_TYPE	 => p_SYS_DOC_TYPE,
				      p_invc_note_type	 => 390)
		THEN
		   1
		ELSE
		   0
	     END;
   END is_third_party;

   FUNCTION is_self_billed (p_cntry_2_ltr	VARCHAR2,
			    p_SPSFC_TYP 	NUMBER,
			    p_invc_trns_code	NUMBER,
			    p_SYS_DOC_TYPE	NUMBER DEFAULT 4)
      RETURN NUMBER
   IS
   BEGIN
      RETURN CASE
		WHEN chk_e_invc_type (p_cntry_2_ltr	 => p_cntry_2_ltr,
				      p_SPSFC_TYP	 => p_SPSFC_TYP,
				      p_invc_trns_code	 => p_invc_trns_code,
				      p_SYS_DOC_TYPE	 => p_SYS_DOC_TYPE,
				      p_invc_note_type	 => 389)
		THEN
		   1
		ELSE
		   0
	     END;
   END is_self_billed;

   FUNCTION GET_TAX_CLC_CAT_CODE (P_TAX_CLC_TYP_NO	NUMBER,
				  P_CNTRY_2_LTR_CODE	VARCHAR2)
      RETURN VARCHAR2
   IS
      V_CLC_TAX_TYP	   GNR_TAX_TYP_CLC_MST.CLC_TAX_TYP%TYPE;
      V_CNTRY_2_LTR_CODE   VARCHAR (2);
      V_CNT		   NUMBER (1) := 0;
      V_TAX_CAT_CODE	   VARCHAR (3);
   BEGIN
      BEGIN
	 SELECT 1
	   INTO V_CNT
	   FROM s_TAX_TYP_ACTV
	  WHERE     VAT_STS = 1
		AND UPPER (CNTRY_2_LTR_CODE) = UPPER (P_CNTRY_2_LTR_CODE)
		AND ROWNUM <= 1;

	 V_CNTRY_2_LTR_CODE := P_CNTRY_2_LTR_CODE;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    V_CNTRY_2_LTR_CODE := 'A';
      END;

      SELECT CLC_TAX_TYP
	INTO V_CLC_TAX_TYP
	FROM GNR_TAX_TYP_CLC_MST
       WHERE CLC_TYP_NO = P_TAX_CLC_TYP_NO AND ROWNUM <= 1;

      SELECT TAX_CAT_CODE
	/*, TAX_ID,
	   CNTRY_2_LTR_CODE, VAT_STS, VAT_STNDRD_RT,
	   ALLOW_CHNG_RT_ITM, VAT_NED_RSN, INPT_VAT_DCRS,
	   VAT_TYP_SI, ALW_VAT_CAT, VAT_TYP_ITM*/
	INTO V_TAX_CAT_CODE
	FROM s_TAX_TYP_ACTV
       WHERE	 TAX_CODE = 'VAT'
	     AND VAT_STS = 1
	     AND BITAND (VAT_TYP_SI, POWER (2, V_CLC_TAX_TYP)) =
		    POWER (2, V_CLC_TAX_TYP)
	     AND UPPER (CNTRY_2_LTR_CODE) = UPPER (V_CNTRY_2_LTR_CODE)
	     AND ROWNUM <= 1;

      RETURN UPPER (V_TAX_CAT_CODE);
   EXCEPTION
      WHEN OTHERS
      THEN
	 RETURN NULL;
   END GET_TAX_CLC_CAT_CODE;

   FUNCTION GET_ITM_VAT_CAT_CODE (P_ITM_VAT_TYP 	NUMBER,
				  P_CNTRY_2_LTR_CODE	VARCHAR2)
      RETURN VARCHAR2
   IS
      V_CNTRY_2_LTR_CODE   VARCHAR (2);
      V_CNT		   NUMBER (1) := 0;
      V_TAX_CAT_CODE	   VARCHAR (3);
   BEGIN
      BEGIN
	 SELECT 1
	   INTO V_CNT
	   FROM s_TAX_TYP_ACTV
	  WHERE     VAT_STS = 1
		AND UPPER (CNTRY_2_LTR_CODE) = UPPER (P_CNTRY_2_LTR_CODE)
		AND ROWNUM <= 1;

	 V_CNTRY_2_LTR_CODE := P_CNTRY_2_LTR_CODE;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    V_CNTRY_2_LTR_CODE := 'A';
      END;


      SELECT TAX_CAT_CODE
	INTO V_TAX_CAT_CODE
	FROM s_TAX_TYP_ACTV
       WHERE	 TAX_CODE = 'VAT'
	     AND VAT_STS = 1
	     AND BITAND (VAT_TYP_ITM, POWER (2, P_ITM_VAT_TYP)) =
		    POWER (2, P_ITM_VAT_TYP)
	     AND UPPER (CNTRY_2_LTR_CODE) = UPPER (V_CNTRY_2_LTR_CODE)
	     AND ROWNUM <= 1;

      RETURN UPPER (V_TAX_CAT_CODE);
   EXCEPTION
      WHEN OTHERS
      THEN
	 RETURN NULL;
   END GET_ITM_VAT_CAT_CODE;

   FUNCTION CHK_TAX_CAT_RSN (P_TAX_CAT_CODE	   VARCHAR2,
			     P_CNTRY_2_LTR_CODE    VARCHAR2)
      RETURN NUMBER
   IS
      V_CNTRY_2_LTR_CODE   VARCHAR (2);
      V_CNT		   NUMBER (1) := 0;
      V_VAT_NED_RSN	   NUMBER (1);
   BEGIN
      BEGIN
	 SELECT 1
	   INTO V_CNT
	   FROM s_TAX_TYP_ACTV
	  WHERE     VAT_STS = 1
		AND UPPER (CNTRY_2_LTR_CODE) = UPPER (P_CNTRY_2_LTR_CODE)
		AND ROWNUM <= 1;

	 V_CNTRY_2_LTR_CODE := P_CNTRY_2_LTR_CODE;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    V_CNTRY_2_LTR_CODE := 'A';
      END;

      SELECT VAT_NED_RSN
	/*, TAX_ID,
	   CNTRY_2_LTR_CODE, VAT_STS, VAT_STNDRD_RT,
	   ALLOW_CHNG_RT_ITM, VAT_NED_RSN, INPT_VAT_DCRS,
	   VAT_TYP_SI, ALW_VAT_CAT, VAT_TYP_ITM*/
	INTO V_VAT_NED_RSN
	FROM s_TAX_TYP_ACTV
       WHERE	 TAX_CODE = 'VAT'
	     AND VAT_STS = 1
	     AND UPPER (TAX_CAT_CODE) = UPPER (P_TAX_CAT_CODE)
	     AND UPPER (CNTRY_2_LTR_CODE) = UPPER (V_CNTRY_2_LTR_CODE)
	     AND ROWNUM <= 1;

      RETURN V_VAT_NED_RSN;
   EXCEPTION
      WHEN OTHERS
      THEN
	 RETURN 0;
   END CHK_TAX_CAT_RSN;

   FUNCTION GET_ITM_VAT_CAT_rate (P_VAT_CAT_CODE	VARCHAR2,
				  P_CNTRY_2_LTR_CODE	VARCHAR2)
      RETURN NUMBER
   IS
      V_CNTRY_2_LTR_CODE   VARCHAR (2);
      V_CNT		   NUMBER (1) := 0;
      v_VAT_STNDRD_RT	   NUMBER (3);
   BEGIN
      BEGIN
	 SELECT 1
	   INTO V_CNT
	   FROM s_TAX_TYP_ACTV
	  WHERE     VAT_STS = 1
		AND UPPER (CNTRY_2_LTR_CODE) = UPPER (P_CNTRY_2_LTR_CODE)
		AND ROWNUM <= 1;

	 V_CNTRY_2_LTR_CODE := P_CNTRY_2_LTR_CODE;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    V_CNTRY_2_LTR_CODE := 'A';
      END;


      SELECT VAT_STNDRD_RT
	INTO v_VAT_STNDRD_RT
	FROM s_TAX_TYP_ACTV
       WHERE	 VAT_STS = 1
	     AND UPPER (TAX_CAT_cODE) = UPPER (P_VAT_CAT_CODE)
	     AND UPPER (CNTRY_2_LTR_CODE) = UPPER (V_CNTRY_2_LTR_CODE)
	     AND ROWNUM <= 1;

      RETURN v_VAT_STNDRD_RT;
   EXCEPTION
      WHEN OTHERS
      THEN
	 RETURN NULL;
   END GET_ITM_VAT_CAT_rate;

   FUNCTION CHK_ITM_VAT_RATE_CHNG (P_VAT_CAT_CODE	 VARCHAR2,
				   P_CNTRY_2_LTR_CODE	 VARCHAR2)
      RETURN NUMBER
   IS
      V_CNTRY_2_LTR_CODE    VARCHAR (2);
      V_CNT		    NUMBER (1) := 0;
      V_ALLOW_CHNG_RT_ITM   NUMBER (1);
   BEGIN
      BEGIN
	 SELECT 1
	   INTO V_CNT
	   FROM s_TAX_TYP_ACTV
	  WHERE     VAT_STS = 1
		AND UPPER (CNTRY_2_LTR_CODE) = UPPER (P_CNTRY_2_LTR_CODE)
		AND ROWNUM <= 1;

	 V_CNTRY_2_LTR_CODE := P_CNTRY_2_LTR_CODE;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    V_CNTRY_2_LTR_CODE := 'A';
      END;


      SELECT ALLOW_CHNG_RT_ITM
	INTO V_ALLOW_CHNG_RT_ITM
	FROM s_TAX_TYP_ACTV
       WHERE	 VAT_STS = 1
	     AND UPPER (TAX_CAT_cODE) = UPPER (P_VAT_CAT_CODE)
	     AND UPPER (CNTRY_2_LTR_CODE) = UPPER (V_CNTRY_2_LTR_CODE)
	     AND ROWNUM <= 1;

      RETURN V_ALLOW_CHNG_RT_ITM;
   EXCEPTION
      WHEN OTHERS
      THEN
	 RETURN NULL;
   END CHK_ITM_VAT_RATE_CHNG;

   FUNCTION get_cntry_code_by_cmp (p_cmp_no NUMBER, P_TYPE NUMBER DEFAULT 0)
      RETURN VARCHAR2
   IS
      V_CLC_TAX_TYP	   GNR_TAX_TYP_CLC_MST.CLC_TAX_TYP%TYPE;
      V_CNTRY_2_LTR_CODE   VARCHAR (2);
      v_CNTRY_NO	   NUMBER (6);
      V_TAX_CAT_CODE	   VARCHAR (3);
      V_INPT_TABLE_NAME    VARCHAR2 (30);
      V_CNT		   NUMBER (1);
   BEGIN
      CASE P_TYPE
	 WHEN 1
	 THEN
	    V_INPT_TABLE_NAME := 'S_ALLWNC_CODE_LIST';
	 WHEN 2
	 THEN
	    V_INPT_TABLE_NAME := 'S_CHRG_CODE_LST';
	 WHEN 3
	 THEN
	    V_INPT_TABLE_NAME := 'S_CID_ITM_LIST';
	 WHEN 4
	 THEN
	    V_INPT_TABLE_NAME := 'S_CID_LIST';
	 WHEN 5
	 THEN
	    V_INPT_TABLE_NAME := 'S_CID_LIST_DTL';
	 WHEN 6
	 THEN
	    V_INPT_TABLE_NAME := 'S_CNTRY_CODE_LST';
	 WHEN 7
	 THEN
	    V_INPT_TABLE_NAME := 'S_CNTRY_INPT_CODE_ACTV';
	 WHEN 8
	 THEN
	    V_INPT_TABLE_NAME := 'S_CRNCY_CODE_LST';
	 WHEN 9
	 THEN
	    V_INPT_TABLE_NAME := 'S_INPT_TRNS_LBL';
	 WHEN 10
	 THEN
	    V_INPT_TABLE_NAME := 'S_INVC_NOTE_ACTV';
	 WHEN 11
	 THEN
	    V_INPT_TABLE_NAME := 'S_INVC_NOTE_LIST';
	 WHEN 12
	 THEN
	    V_INPT_TABLE_NAME := 'S_PAY_MNS_ACTV';
	 WHEN 13
	 THEN
	    V_INPT_TABLE_NAME := 'S_PAY_MNS_LIST';
	 WHEN 14
	 THEN
	    V_INPT_TABLE_NAME := 'S_TAX_EXEMPT_RSN_CODE';
	 WHEN 15
	 THEN
	    V_INPT_TABLE_NAME := 'S_TAX_TYP_ACTV';
	 WHEN 16
	 THEN
	    V_INPT_TABLE_NAME := 'S_TAX_TYP_LIST';
	 ELSE
	    V_INPT_TABLE_NAME := '';
      END CASE;


      SELECT CNTRY_NO
	INTO v_CNTRY_NO
	FROM s_cmpny
       WHERE cmp_no = p_cmp_no AND ROWNUM <= 1;

      SELECT CNTRY_2_LTR_CODE
	INTO V_CNTRY_2_LTR_CODE
	FROM CNTRY
       WHERE CNTRY_NO = v_CNTRY_NO AND ROWNUM <= 1;

      BEGIN
	 SELECT CNTRY_INPT_STS
	   INTO V_CNT
	   FROM S_CNTRY_INPT_CODE_ACTV
	  WHERE     UPPER (INPT_TBL_NM) = V_INPT_TABLE_NAME
		AND UPPER (CNTRY_2_LTR) = UPPER (V_CNTRY_2_LTR_CODE)
		AND ROWNUM = 1;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    V_CNT := 0;
	    V_CNTRY_2_LTR_CODE := 'A';
      END;

      IF V_CNT = 0
      THEN
	 V_CNTRY_2_LTR_CODE := 'A';
      END IF;

      RETURN UPPER (V_CNTRY_2_LTR_CODE);
   EXCEPTION
      WHEN OTHERS
      THEN
	 RETURN NULL;
   END get_cntry_code_by_cmp;

   FUNCTION Get_Lang_Abrv (P_Lang_No VARCHAR2)
      RETURN VARCHAR2
   IS
      V_Lang_Abrv   Lang_Def.Lang_Abrv%TYPE;
   BEGIN
      SELECT Lang_Abrv
	INTO V_Lang_Abrv
	FROM Lang_Def
       WHERE Lang_No = P_Lang_No AND ROWNUM <= 1;

      RETURN (V_Lang_Abrv);
   EXCEPTION
      WHEN OTHERS
      THEN
	 RETURN NULL;
   END;

   FUNCTION Get_Cmp_No_By_Tax (P_Tax_No NUMBER)
      RETURN NUMBER
   IS
      V_Cmp_No	 NUMBER;
   BEGIN
      SELECT Conn_Cmp_No
	INTO V_Cmp_No
	FROM Gnr_Tax_Code_Mst
       WHERE Tax_No = P_Tax_No AND ROWNUM <= 1;

      RETURN (V_Cmp_No);
   EXCEPTION
      WHEN OTHERS
      THEN
	 RETURN NULL;
   END;

   FUNCTION Get_Cntry_Code_By_Tax (P_Tax_No NUMBER)
      RETURN VARCHAR2
   IS
      V_Cmp_No	     NUMBER;
      V_Cntry_Code   VARCHAR2 (2);
   BEGIN
      V_Cmp_No := Get_Cmp_No_By_Tax (P_Tax_No);

      V_Cntry_Code := Get_Cntry_Code_By_Cmp (V_Cmp_No, 15);

      RETURN (V_Cntry_Code);
   EXCEPTION
      WHEN OTHERS
      THEN
	 RETURN NULL;
   END;

   FUNCTION Get_Cntry_Code_By_Clc_Mthd (P_Clc_Tax_No NUMBER)
      RETURN VARCHAR2
   IS
      V_Cmp_No	     NUMBER;
      V_Cntry_Code   VARCHAR2 (2);
   BEGIN
      SELECT Conn_Cmp_No
	INTO V_Cmp_No
	FROM Gnr_Tax_Typ_Clc_Mst
       WHERE Clc_Typ_No = P_Clc_Tax_No AND ROWNUM <= 1;

      V_Cntry_Code := Get_Cntry_Code_By_Cmp (V_Cmp_No, 15);

      RETURN (V_Cntry_Code);
   EXCEPTION
      WHEN OTHERS
      THEN
	 RETURN NULL;
   END;

   FUNCTION Get_Tax_Code (P_Tax_No NUMBER)
      RETURN VARCHAR2
   IS
      V_Tax_Typ_Code   Gnr_Tax_Code_Mst.Tax_Typ_Code%TYPE;
   BEGIN
      SELECT Tax_Typ_Code
	INTO V_Tax_Typ_Code
	FROM Gnr_Tax_Code_Mst
       WHERE Tax_No = P_Tax_No AND ROWNUM <= 1;

      RETURN (V_Tax_Typ_Code);
   EXCEPTION
      WHEN OTHERS
      THEN
	 RETURN NULL;
   END;

   FUNCTION Get_Lang_DFLT
      RETURN NUMBER
   IS
      V_Lang_NO   Lang_Def.Lang_NO%TYPE;
   BEGIN
      SELECT Lang_NO
	INTO V_Lang_NO
	FROM Lang_Def
       WHERE NVL (LANG_DFLT, 0) = 1 AND FLG_ST = 1 AND ROWNUM <= 1;

      RETURN (V_Lang_NO);
   EXCEPTION
      WHEN OTHERS
      THEN
	 RETURN NULL;
   END;

   FUNCTION get_e_invc_main_type (p_cntry_2_ltr       VARCHAR2,
				  p_SPSFC_TYP	      NUMBER,
				  p_invc_note_type    NUMBER,
				  p_SYS_DOC_TYPE      NUMBER DEFAULT 4)
    RETURN NUMBER
   IS
      v_invc_note_type	 NUMBER (3);
   BEGIN
      BEGIN
	 SELECT actv.MAIN_INVC_NOTE_TYP
	   INTO v_invc_note_type
	   FROM s_invc_note_list lst, s_invc_note_actv actv
	  WHERE     lst.invc_note_type = actv.invc_note_type
		AND SPSFC_TYPe_id = p_SPSFC_TYP
		AND NVL (SYS_DOC_TYPE, 0) = NVL (p_SYS_DOC_TYPE, 0)
		AND UPPER (actv.cntry_2_ltr_code) = UPPER (p_cntry_2_ltr)
		AND actv.invc_note_type = NVL (p_invc_note_type, 0)
		AND ROWNUM <= 1;
      END;

      RETURN v_invc_note_type;
   END get_e_invc_main_type;

   FUNCTION get_e_invc_pay_mns_code (P_BRN_NO	      s_brn.brn_no%TYPE,
				     p_doc_type       NUMBER,
				     p_e_INVC_CODE    NUMBER,
				     p_pay_mthd_no    NUMBER,
				     p_lang_id	      NUMBER,
				     p_type	      NUMBER)
      RETURN VARCHAR2
   IS
      v_pay_mns       VARCHAR2 (100);
      v_cntry_2_ltr   VARCHAR2 (2);
   BEGIN
      v_cntry_2_ltr :=
	 get_cntry_code_by_cmp (p_cmp_no => NVL( IAS_BRN_PKG.GET_BRN_MAIN_CMP(P_BRN_NO=> P_BRN_NO),1),P_TYPE=> 12);
      BEGIN
	 IF p_type = 1 THEN
	    SELECT PAY_MNS_CODE
	      INTO v_pay_mns
	      FROM S_PAY_MNS_ACTV
	     WHERE     PAY_MNS_STS = 1
		   AND SYS_DOC_TYPE = p_doc_type
		   AND UPPER (CNTRY_2_LTR_CODE) = UPPER (v_cntry_2_ltr)
		   AND BITAND (STD_INVC_CODE, p_e_INVC_CODE) = p_e_INVC_CODE
		   AND BITAND (SYS_PAY_MNS_CODE, POWER (2, p_pay_mthd_no)) =
			  POWER (2, p_pay_mthd_no);
	 ELSIF p_type = 2 THEN
	    SELECT CID_ADDR_OP_PKG.get_trns_lbl (
		      p_cntry_2_ltr    => v_cntry_2_ltr,
		      p_lang_code      => Get_Lang_Abrv (
					    P_Lang_No	=> TO_CHAR (p_lang_id)),
		      p_lang_id        => p_lang_id,
		      p_CID_NAME_LBL   => PAY_MNS_NM_LBL)
	      INTO v_pay_mns
	      FROM S_PAY_MNS_list lst, S_PAY_MNS_ACTV actv
	     WHERE     lst.PAY_MNS_CODE = actv.PAY_MNS_CODE
		   AND PAY_MNS_STS = 1
		   AND SYS_DOC_TYPE = p_doc_type
		   AND UPPER (CNTRY_2_LTR_CODE) = UPPER (v_cntry_2_ltr)
		   AND BITAND (STD_INVC_CODE, p_e_INVC_CODE) = p_e_INVC_CODE
		   AND BITAND (SYS_PAY_MNS_CODE, POWER (2, p_pay_mthd_no)) =
			  POWER (2, p_pay_mthd_no);
	 ELSIF p_type = 3 THEN
	    SELECT    lst.PAY_MNS_CODE
		   || '-'
		   || CID_ADDR_OP_PKG.get_trns_lbl (
			 p_cntry_2_ltr	  => v_cntry_2_ltr,
			 p_lang_code	  => Get_Lang_Abrv (
					       P_Lang_No   => TO_CHAR (
								p_lang_id)),
			 p_lang_id	  => p_lang_id,
			 p_CID_NAME_LBL   => PAY_MNS_NM_LBL)
	      INTO v_pay_mns
	      FROM S_PAY_MNS_list lst, S_PAY_MNS_ACTV actv
	     WHERE     lst.PAY_MNS_CODE = actv.PAY_MNS_CODE
		   AND PAY_MNS_STS = 1
		   AND SYS_DOC_TYPE = p_doc_type
		   AND UPPER (CNTRY_2_LTR_CODE) = UPPER (v_cntry_2_ltr)
		   AND BITAND (STD_INVC_CODE, p_e_INVC_CODE) = p_e_INVC_CODE
		   AND BITAND (SYS_PAY_MNS_CODE, POWER (2, p_pay_mthd_no)) =
			  POWER (2, p_pay_mthd_no);
	 END IF;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    v_pay_mns := NULL;
      END;
      RETURN v_pay_mns;
   END get_e_invc_pay_mns_code;
END gnr_e_invc_op;
/

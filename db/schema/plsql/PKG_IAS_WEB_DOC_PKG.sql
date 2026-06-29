-- =============================================
-- PACKAGE SPEC: IAS_WEB_DOC_PKG  (status: VALID)
-- =============================================
CREATE OR REPLACE
Package Ias_Web_Doc_Pkg As

procedure GetDocMst(p_doc_type	in  number,
		    p_lang_no	in  number,
		    p_whr	in  varchar2,
		    p_ref_cur	out sys_refcursor,
		    p_error	out varchar2,
		    p_actv_no	in  number,
		    p_sys_no	in number) ;

procedure GetDocDtl(p_doc_type	in  number,
		    p_lang_no	in  number,
		    p_doc_Ser	in  number,
		    p_ref_cur	out sys_refcursor,
		    p_error	out varchar2,
		    p_actv_no  in  number,
		    p_sys_no	in number) ;

procedure GetTaxInpt(p_lang_no	 in  number,
		    p_doc_ser	in  number,
		    p_ref_cur	out sys_refcursor,
		    p_error	out varchar2,
		    p_pos	in  number default 0);

procedure GetTaxMvmnt(p_lang_no   in  number,
		    p_doc_Ser	in  number,
		    p_ref_cur	out sys_refcursor,
		    p_error	out varchar2,
		    p_pos	in  number default 0) ;


procedure GET_inpt_data(    P_inpt_typ	   In	  Varchar2
			   ,P_Fld_Nm1	   In	  Varchar2 Default Null
			   ,P_Fld_Nm2	   In	  Varchar2 Default Null
			   ,P_Fld_Nm3	   In	  Varchar2 Default Null
			   ,P_Fld_Nm4	   In	  Varchar2 Default Null
			   ,P_Fld_Val1	   In	  Varchar2 Default Null
			   ,P_Fld_Val2	   In	  Varchar2 Default Null
			   ,P_Fld_Val3	   In	  Varchar2 Default Null
			   ,P_Fld_Val4	   In	  Varchar2 Default Null
			   ,P_whr	   In	  Varchar2 Default Null
			   ,P_Usr_no	   In	  Number   Default Null
			   ,P_Brn_no	   In	  Number   Default Null
			   ,p_ref_cur	   OUT	  SYS_REFCURSOR
			   ,p_error	   Out	  Varchar2);

FUNCTION Get_Hashed_Doc_Ser(p_doc_ser	In	number,
			    p_ad_date	In	date)
			    return varchar2;

FUNCTION Get_DOC_GUID(p_doc_ser     In	    number,
		      p_ad_date     In	    date,
		      p_doc_typ     In	    number,
		      p_brn_usr     In	    number,
		      p_sys_no	    In	    number  default null,
		      p_year	    In	    number  default null)
		      return varchar2;

function Create_TLV_Tag(p_tag_no in  number,
			p_data	in  varchar2)
			return RAW;

function Get_Doc_Qr_Data(  p_saller_name	    in	  varchar2,
			   p_tax_code		    in	  varchar2,
			   p_ad_date		    in	  date,
			   p_bill_tot_incld_vat     in	  varchar2,
			   p_vat_tot		    in	  varchar2,
			   p_base64_encoded	    in	  number default 0)
			   return varchar2;

/*function Get_Doc_Qr_Data(  p_guid	   in	  varchar2)
			   return varchar2;*/

function Validate_Onyx_User(p_user_id		    in	  number,
			    p_user_password	    in	  varchar2)
			    return number;

function Get_Purchase_Desc( p_doc_type	 in	 number,
			    p_doc_ser	in	number,
			    p_desc	 in	 varchar2,
			    p_return_desc_no	in  number default 0)
			    return varchar2 ;

End Ias_Web_Doc_Pkg ;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_WEB_DOC_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
Package Body Ias_Web_Doc_Pkg as
procedure GetDocMst(p_doc_type	in  number,
		    p_lang_no	in  number,
		    p_whr	in  varchar2,
		    p_ref_cur	out sys_refcursor,
		    p_error	out varchar2,
		    p_actv_no	in  number,
		    p_sys_no	in number)
as
v_msg_txt   varchar2(4000);
v_pkg_line  varchar2(4000);
v_err_line  varchar2(4000);
begin
    if p_doc_type is null then
	v_err_line := $$plsql_line;
	v_msg_txt := 'Parameter p_doc_type is null';
	goto prc_end;
    end if;

    if p_doc_type = 2 then
	open p_ref_cur for '
	SELECT
	   VOUCHER_TYPE,
	   ys_gen_pkg.Get_Flg_Nm (''POST_DOC_TYPE'',VOUCHER_TYPE+1 ,'||p_lang_no||') VOUCHER_TYPE_NAME,
	   VOUCHER_PAY_TYPE,
	   IAS_GEN_PKG.GET_PROMPT('||p_lang_no||', DECODE(VOUCHER_PAY_TYPE,1,153,11792)) VOUCHER_PAY_TYPE_NAME,
	   VOUCHER_NO,
	   CASH_NO,
	   DECODE(VOUCHER_PAY_TYPE,
		    1, ys_gen_pkg.Get_Fld_Value(''CASH_IN_HAND'', DECODE('||p_lang_no||',1,''CASH_NAME'',''NVL(CASH_E_NAME,CASH_NAME)''), '' WHERE CASH_NO=''||CASH_NO),
		    2, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
		    NULL) CASH_NAME,
	   A_CY,
	   to_char(V_SER) V_SER,
	   TO_CHAR(VOUCHER_DATE,''DD/MM/YYYY'') VOUCHER_DATE,
	   ROUND(Nvl(CASH_AMTF,CASH_AMT),15) CASH_AMT,
	   ROUND(EX_RATE,15) EX_RATE,
	   A_DESC,
	   REC_NAME,
	   CC_CODE,
	   IAS_CC_CODE_PKG.GET_CC_NAME(CC_CODE, '||p_lang_no||') CC_NAME,
	   PJ_NO,
	   ACTV_NO,
	   BRN_NO,
	   BRN_YEAR,
	   BRN_USR,
	   REF_NO,
	   TAFKEET(nvl(CASH_AMTF,CASH_AMT),A_CY,'||p_lang_no||') AMT_WRITTEN,
	   IAS_WEB_DOC_PKG.GET_DOC_GUID(V_SER, AD_DATE, 2, BRN_USR, NULL, BRN_YEAR) GUID,
	   TO_CHAR(AD_DATE,''DD/MM/YYYY HH24:MI:SS'') AD_DATE,
	   DOC_PST_SQ
	FROM GLS_V_VCHR_MST_YR
	WHERE 1=1
	AND VOUCHER_TYPE= 1
	'||p_whr||'
	ORDER BY VOUCHER_NO
	';
    elsif p_doc_type = 4 then
	if nvl(p_sys_no,0) = 61 then
	    open p_ref_cur for '
		SELECT
		      BILL_DOC_TYPE,
		      BILL_NO,
		      to_char(BILL_SER) BILL_SER,
		      TO_CHAR(BILL_DATE,''DD/MM/YYYY'') BILL_DATE,
		      BILL_CURRENCY,
		      round(BILL_RATE,15) BILL_RATE,
		      C_CODE,
		      C_NAME,
		      A_CODE,
		      CHEQUE_NO,
		      CHEQUE_AMT,
		      TO_CHAR(CHEQUE_DUE_DATE,''DD/MM/YYYY'') CHEQUE_DUE_DATE,
		      TO_CHAR(BILL_DUE_DATE,''DD/MM/YYYY'') BILL_DUE_DATE,
		      ROUND(DISC_AMT,15) DISC_AMT,
		      ROUND(DISC_AMT_MST,15) DISC_AMT_MST,
		      ROUND(OTHR_AMT,15) OTHR_AMT,
		      ROUND(VAT_AMT,15) + NVL(VAT_AMT_OTHR,0) VAT_AMT,
		      ROUND(BILL_AMT,15) BILL_AMT,
		      W_CODE,
		      R_CODE,
		      REP_CODE,
		      CASH_NO,
		      ACTV_NO,
		      CC_CODE,
		      SI_TYPE,
		      A_DESC,
		      C_TEL,
		      C_ADDRESS,
		      DRIVER_NO,
		      MOBILE_NO,
		      CMP_NO,
		      BRN_NO,
		      BRN_YEAR,
		      BRN_USR,
		      ys_gen_pkg.Get_Flg_Nm (''TYPE_NAME_SI'',BILL_DOC_TYPE ,'||p_lang_no||') BILL_DOC_TYPE_NAME,
		      IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')W_NAME,
		      ys_gen_pkg.Get_Fld_Value(''REGIONS'', DECODE('||p_lang_no||',1,''R_A_NAME'',''NVL(R_E_NAME,R_A_NAME)''), '' WHERE R_CODE=''||R_CODE) R_NAME,
		      IAS_SMAN_PKG.Get_Sman_Name(REP_CODE,'||p_lang_no||') REP_NAME,
		      DECODE(BILL_DOC_TYPE,
				    1, ys_gen_pkg.Get_Fld_Value(''CASH_IN_HAND'', DECODE('||p_lang_no||',1,''CASH_NAME'',''NVL(CASH_E_NAME,CASH_NAME)''), '' WHERE CASH_NO=''||CASH_NO),
				    2, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
				    3, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
				    NULL) CASH_NO,
		      IAS_CC_CODE_PKG.GET_CC_NAME(CC_CODE, '||p_lang_no||') CC_NAME,
		      ys_gen_pkg.Get_Fld_Value(''IAS_SALES_TYPES'', DECODE('||p_lang_no||',1,''SI_A_NAME'',''NVL(SI_E_NAME,SI_A_NAME)''), '' WHERE SI_TYPE=''||SI_TYPE) SI_NAME,
		      IAS_WEB_DOC_PKG.GET_DOC_GUID(BILL_SER, AD_DATE, 4, BRN_USR, 61, BRN_YEAR) GUID,
		      TO_CHAR(AD_DATE,''DD/MM/YYYY HH24:MI:SS'') AD_DATE,
		      ys_gen_pkg.Get_Fld_Value(''IAS_SALES_TYPES'',''TAX_ACTV_CODE'' , '' WHERE SI_TYPE=''||SI_TYPE) TAX_ACTV_CODE,
		      DOC_PST_SQ,
		      DOC_HASH,
		      TAX_BILL_TYP,
		      ys_gen_pkg.Get_Fld_Value (
		       ''IAS_BILL_DTL'',
		       ''DOC_NO_REF'',
		       '' WHERE ROWNUM<=1 AND BILL_SER='' || BILL_SER) DOC_NO_REF,
		       DECODE (
		       BILL_DOC_TYPE,
		       4, DECODE (
			    ys_gen_pkg.Get_Fld_Value (
				''ORDER_DETAIL'',
				''DOC_TYPE_REF'',
				'' WHERE ROWNUM<=1 AND ORDER_SER=''
				|| ys_gen_pkg.Get_Fld_Value (
				    ''IAS_BILL_DTL'',
				    ''DOC_SER_REF'',
				    '' WHERE ROWNUM<=1 AND BILL_SER='' || BILL_SER)),
			    42, ys_gen_pkg.Get_Fld_Value (
				    ''ORDER_DETAIL'',
				    ''DOC_NO_REF'',
				    '' WHERE ROWNUM<=1 AND ORDER_SER=''
				    || ys_gen_pkg.Get_Fld_Value (
					''IAS_BILL_DTL'',
					''DOC_SER_REF'',
					'' WHERE ROWNUM<=1 AND BILL_SER='' || BILL_SER)),
			    NVL (
				ys_gen_pkg.Get_Fld_Value (
				    ''SALES_ORDER'',
				    ''REF_DOC_NO'',
				    '' WHERE ORDER_SER=''
				    || ys_gen_pkg.Get_Fld_Value (
					''IAS_BILL_DTL'',
					''DOC_SER_REF'',
					'' WHERE ROWNUM<=1 AND BILL_SER='' || BILL_SER)),
				REF_NO)), NULL) PURCHASE_ORDER,
			TAX_BILL_TYP,
			CLC_TYP_NO_TAX,
			YS_TAX_PKG.GET_TAX_TYP_NO(P_CLC_TYP_NO => CLC_TYP_NO_TAX) TAX_CAT_TYP,
			EXTERNAL_POST,
			ias_web_doc_pkg.Get_Purchase_Desc(4, bill_ser, a_desc) PURCHASE_ORDER_DESC,
			FIELD1,
			case when bill_doc_type in (2,3,5,7) then nvl((select decode('||p_lang_no||', 1, bank_name, bank_e_name ) from cash_at_bank where bank_no=cash_no),field5) end bank_name,
			case when bill_doc_type in (2,3,5,7) then nvl((select bank_acc from cash_at_bank where bank_no=cash_no),field6) end bank_acc_no,
			case when bill_doc_type in (2,3,5,7) then nvl((select b_address from cash_at_bank where bank_no=cash_no),field9) end bank_address,
			case when bill_doc_type in (2,3,5,7) then field7 end bank_swift_code,
			case when bill_doc_type in (2,3,5,7) then nvl((select bnk_ac from IAS_CASH_AT_BANK_DTL where bank_no=cash_no and a_cy=bill_currency),field8) end bank_acc_iban,
			case when bill_doc_type in (2,3,5,7) then field10 end bank_terms
		FROM IAS_V_BILL_MST_YR
		WHERE 1=1
		'||p_whr||'
		ORDER BY BILL_NO';

	elsif nvl(p_sys_no,0) = 80 then
	    open p_ref_cur for '
		SELECT
		  BILL_TYPE,
		  BILL_NO,
		  TO_CHAR(BILL_NO) BILL_SER,
		  TO_CHAR(BILL_DATE,''DD/MM/YYYY'') BILL_DATE,
		  A_CY BILL_CURRENCY,
		  BILL_RATE,
		  C_CODE,
		  IAS_CST_PKG.GET_C_NAME(C_CODE,'||p_lang_no||') C_NAME,
		  null A_CODE,
		  CHEQUE_NO,
		  CHEQUE_AMT,
		  TO_CHAR(CHEQUE_DUE_DATE,''DD/MM/YYYY'') CHEQUE_DUE_DATE,
		  BILL_DATE,
		  ROUND(DISC_AMT,15) DISC_AMT,
		  ROUND(OTHR_AMT,15) OTHR_AMT,
		  ROUND(VAT_AMT,15) VAT_AMT,
		  ROUND(BILL_AMT,15) BILL_AMT,
		  W_CODE,
		  NULL ACTV_NO,
		  null R_CODE,
		  REP_CODE,
		  CASH_NO,
		  null CC_CODE,
		  SI_TYPE,
		  bill_note A_DESC,
		  null C_TEL,
		  null C_ADDRESS,
		  null DRIVER_NO,
		  MOBILE_NO,
		  CMP_NO,
		  BRN_NO,
		  BRN_YEAR,
		  BRN_USR,
		  ys_gen_pkg.Get_Flg_Nm (''TYPE_NAME_SI'',BILL_TYPE ,'||p_lang_no||') BILL_DOC_TYPE_NAME,
		  IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')W_NAME,
		  null R_NAME,
		  null /*IAS_SMAN_PKG.Get_Sman_Name(REP_CODE,'||p_lang_no||')*/ REP_NAME,
		  DECODE(BILL_TYPE,
				1, ys_gen_pkg.Get_Fld_Value(''CASH_IN_HAND'', DECODE('||p_lang_no||',1,''CASH_NAME'',''NVL(CASH_E_NAME,CASH_NAME)''), '' WHERE CASH_NO=''||CASH_NO),
				2, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
				3, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
				NULL) CASH_NO,
		  null CC_NAME,
		  ys_gen_pkg.Get_Fld_Value(''IAS_SALES_TYPES'', DECODE('||p_lang_no||',1,''SI_A_NAME'',''NVL(SI_E_NAME,SI_A_NAME)''), '' WHERE SI_TYPE=''||SI_TYPE) SI_NAME,
		  IAS_BRN_PKG.GET_BR_NM(BRN_NO,'||p_lang_no||') BRN_NAME,
		  IAS_BRN_PKG.GET_CMP_NM(CMP_NO,'||p_lang_no||') CMP_NAME,
		  IAS_WEB_DOC_PKG.GET_DOC_GUID(BILL_NO, AD_DATE, 4, BRN_USR, 80) GUID,
		  TO_CHAR(AD_DATE,''DD/MM/YYYY HH24:MI:SS'') AD_DATE,
		  ys_gen_pkg.Get_Fld_Value(''IAS_SALES_TYPES'',''TAX_ACTV_CODE'' , '' WHERE SI_TYPE=''||SI_TYPE) TAX_ACTV_CODE,
		  NULL DOC_PST_SQ,
		  NULL DOC_HASH,
		  FIELD1,
		  IAS_WEB_DOC_PKG.Get_Doc_qr_code( p_sys_no    => '||p_sys_no||',
						   p_brn_no    => brn_no,
						   p_doc_type  => '||p_doc_type||',
						   p_doc_ser   => bill_srl,
						   p_uuid      => web_srvc_uuid) QR,
		  CUST_CODE C_CODE_CSH
		FROM YSPOS'||p_actv_no||'.IAS_POS_BILL_MST
		WHERE 1=1 '||p_whr||'
		union all
		SELECT
		  BILL_TYPE,
		  BILL_NO,
		  TO_CHAR(BILL_NO) BILL_SER,
		  TO_CHAR(BILL_DATE,''DD/MM/YYYY'') BILL_DATE,
		  A_CY BILL_CURRENCY,
		  BILL_RATE,
		  C_CODE,
		  IAS_CST_PKG.GET_C_NAME(C_CODE,'||p_lang_no||') C_NAME,
		  null A_CODE,
		  CHEQUE_NO,
		  CHEQUE_AMT,
		  TO_CHAR(CHEQUE_DUE_DATE,''DD/MM/YYYY'') CHEQUE_DUE_DATE,
		  BILL_DATE,
		  ROUND(DISC_AMT,15) DISC_AMT,
		  ROUND(OTHR_AMT,15) OTHR_AMT,
		  ROUND(VAT_AMT,15) VAT_AMT,
		  ROUND(BILL_AMT,15) BILL_AMT,
		  W_CODE,
		  NULL ACTV_NO,
		  null R_CODE,
		  REP_CODE,
		  CASH_NO,
		  null CC_CODE,
		  SI_TYPE,
		  bill_note A_DESC,
		  null C_TEL,
		  null C_ADDRESS,
		  null DRIVER_NO,
		  MOBILE_NO,
		  CMP_NO,
		  BRN_NO,
		  BRN_YEAR,
		  BRN_USR,
		  ys_gen_pkg.Get_Flg_Nm (''TYPE_NAME_SI'',BILL_TYPE ,'||p_lang_no||') BILL_DOC_TYPE_NAME,
		  IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')W_NAME,
		  null R_NAME,
		  null /*IAS_SMAN_PKG.Get_Sman_Name(REP_CODE,'||p_lang_no||')*/ REP_NAME,
		  DECODE(BILL_TYPE,
				1, ys_gen_pkg.Get_Fld_Value(''CASH_IN_HAND'', DECODE('||p_lang_no||',1,''CASH_NAME'',''NVL(CASH_E_NAME,CASH_NAME)''), '' WHERE CASH_NO=''||CASH_NO),
				2, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
				3, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
				NULL) CASH_NO,
		  null CC_NAME,
		  ys_gen_pkg.Get_Fld_Value(''IAS_SALES_TYPES'', DECODE('||p_lang_no||',1,''SI_A_NAME'',''NVL(SI_E_NAME,SI_A_NAME)''), '' WHERE SI_TYPE=''||SI_TYPE) SI_NAME,
		  IAS_BRN_PKG.GET_BR_NM(BRN_NO,'||p_lang_no||') BRN_NAME,
		  IAS_BRN_PKG.GET_CMP_NM(CMP_NO,'||p_lang_no||') CMP_NAME,
		  IAS_WEB_DOC_PKG.GET_DOC_GUID(BILL_NO, AD_DATE, 4, BRN_USR, 80) GUID,
		  TO_CHAR(AD_DATE,''DD/MM/YYYY HH24:MI:SS'') AD_DATE,
		  ys_gen_pkg.Get_Fld_Value(''IAS_SALES_TYPES'',''TAX_ACTV_CODE'' , '' WHERE SI_TYPE=''||SI_TYPE) TAX_ACTV_CODE,
		  NULL DOC_PST_SQ,
		  NULL DOC_HASH,
		  FIELD1,
		  IAS_WEB_DOC_PKG.Get_Doc_qr_code( p_sys_no    => '||p_sys_no||',
						   p_brn_no    => brn_no,
						   p_doc_type  => '||p_doc_type||',
						   p_doc_ser   => bill_srl,
						   p_uuid      => web_srvc_uuid) QR,
		  CUST_CODE C_CODE_CSH
		FROM YSPOS'||p_actv_no||'.IAS_POS_HST_BILL_MST IAS_POS_BILL_MST
		WHERE 1=1 '||p_whr||'
		ORDER BY BILL_NO';
	elsif nvl(p_sys_no,0) = 87 then
	    open p_ref_cur for '
		SELECT
		  BILL_TYPE,
		  BILL_NO,
		  TO_CHAR(BILL_SRL) BILL_SER,
		  TO_CHAR(BILL_DATE,''DD/MM/YYYY'') BILL_DATE,
		  A_CY BILL_CURRENCY,
		  BILL_RATE,
		  C_CODE,
		  IAS_CST_PKG.GET_C_NAME(C_CODE,'||p_lang_no||') C_NAME,
		  null A_CODE,
		  CHQ_NO CHEQUE_NO,
		  CHQ_AMT CHEQUE_AMT,
		  TO_CHAR(CHQ_DUE_DATE,''DD/MM/YYYY'') CHEQUE_DUE_DATE,
		  BILL_DATE,
		  ROUND(DISC_AMT,15) DISC_AMT,
		  ROUND(OTHR_AMT,15) OTHR_AMT,
		  ROUND(VAT_AMT,15) VAT_AMT,
		  ROUND(BILL_AMT,15) BILL_AMT,
		  W_CODE,
		  NULL ACTV_NO,
		  RGN_NO R_CODE,
		  --REP_CODE,
		  CASH_NO,
		  null CC_CODE,
		  SI_TYPE,
		  bill_note A_DESC,
		  null C_TEL,
		  null C_ADDRESS,
		  null DRIVER_NO,
		  MOBILE_NO,
		  CMP_NO,
		  BRN_NO,
		  BRN_YEAR,
		  BRN_USR,
		  ys_gen_pkg.Get_Flg_Nm (''TYPE_NAME_SI'',BILL_TYPE ,'||p_lang_no||') BILL_DOC_TYPE_NAME,
		  IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')W_NAME,
		  null R_NAME,
		  null /*IAS_SMAN_PKG.Get_Sman_Name(REP_CODE,'||p_lang_no||')*/ REP_NAME,
		  DECODE(BILL_TYPE,
				1, ys_gen_pkg.Get_Fld_Value(''CASH_IN_HAND'', DECODE('||p_lang_no||',1,''CASH_NAME'',''NVL(CASH_E_NAME,CASH_NAME)''), '' WHERE CASH_NO=''||CASH_NO),
				2, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
				3, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
				NULL) CASH_NO,
		  null CC_NAME,
		  ys_gen_pkg.Get_Fld_Value(''IAS_SALES_TYPES'', DECODE('||p_lang_no||',1,''SI_A_NAME'',''NVL(SI_E_NAME,SI_A_NAME)''), '' WHERE SI_TYPE=''||SI_TYPE) SI_NAME,
		  IAS_BRN_PKG.GET_BR_NM(BRN_NO,'||p_lang_no||') BRN_NAME,
		  IAS_BRN_PKG.GET_CMP_NM(CMP_NO,'||p_lang_no||') CMP_NAME,
		  IAS_WEB_DOC_PKG.GET_DOC_GUID(BILL_SRL, AD_DATE, 4, BRN_USR, 87) GUID,
		  TO_CHAR(AD_DATE,''DD/MM/YYYY HH24:MI:SS'') AD_DATE,
		  ys_gen_pkg.Get_Fld_Value(''IAS_SALES_TYPES'',''TAX_ACTV_CODE'' , '' WHERE SI_TYPE=''||SI_TYPE) TAX_ACTV_CODE,
		  NULL DOC_PST_SQ,
		  NULL DOC_HASH,
		  FLD1
		FROM YSRMS'||p_actv_no||'.RMS_BILL_MST
		WHERE 1=1 '||p_whr||'
		union all
		SELECT
		  BILL_TYPE,
		  BILL_NO,
		  TO_CHAR(BILL_SRL) BILL_SER,
		  TO_CHAR(BILL_DATE,''DD/MM/YYYY'') BILL_DATE,
		  A_CY BILL_CURRENCY,
		  BILL_RATE,
		  C_CODE,
		  IAS_CST_PKG.GET_C_NAME(C_CODE,'||p_lang_no||') C_NAME,
		  null A_CODE,
		  CHQ_NO CHEQUE_NO,
		  CHQ_AMT CHEQUE_AMT,
		  TO_CHAR(CHQ_DUE_DATE,''DD/MM/YYYY'') CHEQUE_DUE_DATE,
		  BILL_DATE,
		  ROUND(DISC_AMT,15) DISC_AMT,
		  ROUND(OTHR_AMT,15) OTHR_AMT,
		  ROUND(VAT_AMT,15) VAT_AMT,
		  ROUND(BILL_AMT,15) BILL_AMT,
		  W_CODE,
		  NULL ACTV_NO,
		  RGN_NO R_CODE,
		  --REP_CODE,
		  CASH_NO,
		  null CC_CODE,
		  SI_TYPE,
		  bill_note A_DESC,
		  null C_TEL,
		  null C_ADDRESS,
		  null DRIVER_NO,
		  MOBILE_NO,
		  CMP_NO,
		  BRN_NO,
		  BRN_YEAR,
		  BRN_USR,
		  ys_gen_pkg.Get_Flg_Nm (''TYPE_NAME_SI'',BILL_TYPE ,'||p_lang_no||') BILL_DOC_TYPE_NAME,
		  IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')W_NAME,
		  null R_NAME,
		  null /*IAS_SMAN_PKG.Get_Sman_Name(REP_CODE,'||p_lang_no||')*/ REP_NAME,
		  DECODE(BILL_TYPE,
				1, ys_gen_pkg.Get_Fld_Value(''CASH_IN_HAND'', DECODE('||p_lang_no||',1,''CASH_NAME'',''NVL(CASH_E_NAME,CASH_NAME)''), '' WHERE CASH_NO=''||CASH_NO),
				2, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
				3, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
				NULL) CASH_NO,
		  null CC_NAME,
		  ys_gen_pkg.Get_Fld_Value(''IAS_SALES_TYPES'', DECODE('||p_lang_no||',1,''SI_A_NAME'',''NVL(SI_E_NAME,SI_A_NAME)''), '' WHERE SI_TYPE=''||SI_TYPE) SI_NAME,
		  IAS_BRN_PKG.GET_BR_NM(BRN_NO,'||p_lang_no||') BRN_NAME,
		  IAS_BRN_PKG.GET_CMP_NM(CMP_NO,'||p_lang_no||') CMP_NAME,
		  IAS_WEB_DOC_PKG.GET_DOC_GUID(BILL_SRL, AD_DATE, 4, BRN_USR, 87) GUID,
		  TO_CHAR(AD_DATE,''DD/MM/YYYY HH24:MI:SS'') AD_DATE,
		  ys_gen_pkg.Get_Fld_Value(''IAS_SALES_TYPES'',''TAX_ACTV_CODE'' , '' WHERE SI_TYPE=''||SI_TYPE) TAX_ACTV_CODE,
		  NULL DOC_PST_SQ,
		  NULL DOC_HASH
		FROM YSRMS'||p_actv_no||'.RMS_HST_BILL_MST RMS_BILL_MST
		WHERE 1=1 '||p_whr||'
		ORDER BY BILL_NO';

	end if;
    elsif p_doc_type = 5 then
	if nvl(p_sys_no,0) = 61 then
	    open p_ref_cur for '
	    SELECT
		    RT_BILL_DOC_TYPE,
		    RT_BILL_NO,
		    TO_CHAR(RT_BILL_SER) RT_BILL_SER,
		    TO_CHAR(RT_BILL_DATE,''DD/MM/YYYY'') RT_BILL_DATE,
		    RT_BILL_CURRENCY,
		    round(RT_BILL_RATE,15) RT_BILL_RATE,
		    C_CODE,
		    C_NAME,
		    A_CODE,
		    CHEQUE_NO,
		    CHEQUE_AMT,
		    TO_CHAR(CHEQUE_DUE_DATE,''DD/MM/YYYY'') CHEQUE_DUE_DATE,
		    ROUND(DISC_AMT,15) DISC_AMT,
		    ROUND(DISC_AMT_MST,15) DISC_AMT_MST,
		    ROUND(OTHR_AMT,15) OTHR_AMT,
		    ROUND(VAT_AMT,15) + NVL(VAT_AMT_OTHR,0) VAT_AMT,
		    ROUND(BILL_AMT,15) BILL_AMT,
		    W_CODE,
		    R_CODE,
		    REP_CODE,
		    CASH_NO,
		    CC_CODE,
		    SR_TYPE,
		    ACTV_NO,
		    A_DESC,
		    C_TEL,
		    DRIVER_NO,
		    BRN_NO,
		    BRN_YEAR,
		    BRN_USR,
		    ys_gen_pkg.Get_Flg_Nm (''TYPE_NAME_SI'',RT_BILL_DOC_TYPE ,'||p_lang_no||') RT_BILL_DOC_TYPE_NAME,
		    IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')WC_NAME,
		    ys_gen_pkg.Get_Fld_Value(''REGIONS'', DECODE('||p_lang_no||',1,''R_A_NAME'',''NVL(R_E_NAME,R_A_NAME)''), '' WHERE R_CODE=''||R_CODE) R_NAME,
		    IAS_SMAN_PKG.Get_Sman_Name(REP_CODE,'||p_lang_no||') REP_NAME,
		    DECODE(RT_BILL_DOC_TYPE,
			       1, ys_gen_pkg.Get_Fld_Value(''CASH_IN_HAND'', DECODE('||p_lang_no||',1,''CASH_NAME'',''NVL(CASH_E_NAME,CASH_NAME)''), '' WHERE CASH_NO=''||CASH_NO),
			       2, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
			       3, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
				NULL) CASH_NO,
		    IAS_CC_CODE_PKG.GET_CC_NAME(CC_CODE, '||p_lang_no||') CC_NAME,
		    ys_gen_pkg.Get_Fld_Value(''IAS_SALES_TYPES'', DECODE('||p_lang_no||',1,''SI_A_NAME'',''NVL(SI_E_NAME,SI_A_NAME)''), '' WHERE SI_TYPE=''||SR_TYPE) SR_NAME,
		    IAS_WEB_DOC_PKG.GET_DOC_GUID(RT_BILL_SER, AD_DATE, 5, BRN_USR, 61, BRN_YEAR) GUID,
		    TO_CHAR(AD_DATE,''DD/MM/YYYY HH24:MI:SS'') AD_DATE,
		    ys_gen_pkg.Get_Fld_Value(''IAS_RT_SALES_TYPES'',''TAX_ACTV_CODE'' , '' WHERE SR_TYPE=''||SR_TYPE) TAX_ACTV_CODE,
		    DOC_PST_SQ,
		    DOC_HASH,
		    TAX_BILL_TYP,
		    CLC_TYP_NO_TAX,
		    YS_TAX_PKG.GET_TAX_TYP_NO(P_CLC_TYP_NO => CLC_TYP_NO_TAX) TAX_CAT_TYP,
		    EXTERNAL_POST,
		    ref_no PURCHASE_ORDER,
		    a_desc PURCHASE_ORDER_DESC,
		    case when rt_bill_doc_type in (2,3,5,7) then nvl((select decode('||p_lang_no||', 1, bank_name, bank_e_name ) from cash_at_bank where bank_no=cash_no),field5) end bank_name,
		    case when rt_bill_doc_type in (2,3,5,7) then nvl((select bank_acc from cash_at_bank where bank_no=cash_no),field6) end bank_acc_no,
		    case when rt_bill_doc_type in (2,3,5,7) then nvl((select b_address from cash_at_bank where bank_no=cash_no),field9) end bank_address,
		    case when rt_bill_doc_type in (2,3,5,7) then field7 end bank_swift_code,
		    case when rt_bill_doc_type in (2,3,5,7) then nvl((select bnk_ac from IAS_CASH_AT_BANK_DTL where bank_no=cash_no and a_cy=rt_bill_currency),field8) end bank_acc_iban,
		    case when rt_bill_doc_type in (2,3,5,7) then field10 end bank_terms
	    FROM IAS_V_RT_BILL_MST_YR
	    WHERE 1=1 '||p_whr||'
	    ORDER BY RT_BILL_NO';
	elsif nvl(p_sys_no,0)=80 then
	    open p_ref_cur for '
	    SELECT
		    RT_BILL_TYPE RT_BILL_DOC_TYPE,
		    RT_BILL_NO,
		    TO_CHAR(RT_BILL_NO) RT_BILL_SER,
		    TO_CHAR(RT_BILL_DATE,''DD/MM/YYYY'') RT_BILL_DATE,
		    A_CY RT_BILL_CURRENCY,
		    round(RT_BILL_RATE,15) RT_BILL_RATE,
		    C_CODE,
		    NULL C_NAME,
		    AC_CODE A_CODE,
		    CHEQUE_NO,
		    CHEQUE_AMT,
		    TO_CHAR(CHEQUE_DUE_DATE,''DD/MM/YYYY'') CHEQUE_DUE_DATE,
		    ROUND(DISC_AMT,15) DISC_AMT,
		    ROUND(DISC_AMT_MST,15) DISC_AMT_MST,
		    ROUND(OTHR_AMT,15) OTHR_AMT,
		    ROUND(VAT_AMT,15) VAT_AMT,
		    ROUND(RT_BILL_AMT,15) BILL_AMT,
		    W_CODE,
		    NULL R_CODE,
		    REP_CODE,
		    CASH_NO,
		    CC_CODE_BILL,
		    SR_TYPE,
		    NULL ACTV_NO,
		    RT_BILL_NOTE A_DESC,
		    MOBILE_NO C_TEL,
		    NULL DRIVER_NO,
		    BRN_NO,
		    BRN_YEAR,
		    BRN_USR,
		    ys_gen_pkg.Get_Flg_Nm (''TYPE_NAME_SI'',RT_BILL_TYPE ,'||p_lang_no||') RT_BILL_DOC_TYPE_NAME,
		    IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')WC_NAME,
		    NULL R_NAME,
		    NULL REP_NAME,
		    DECODE(RT_BILL_TYPE,
			       1, ys_gen_pkg.Get_Fld_Value(''CASH_IN_HAND'', DECODE('||p_lang_no||',1,''CASH_NAME'',''NVL(CASH_E_NAME,CASH_NAME)''), '' WHERE CASH_NO=''||CASH_NO),
			       2, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
			       3, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
				NULL) CASH_NO,
		    IAS_CC_CODE_PKG.GET_CC_NAME(CC_CODE_BILL, '||p_lang_no||') CC_NAME,
		    ys_gen_pkg.Get_Fld_Value(''IAS_SALES_TYPES'', DECODE('||p_lang_no||',1,''SI_A_NAME'',''NVL(SI_E_NAME,SI_A_NAME)''), '' WHERE SI_TYPE=''||SR_TYPE) SR_NAME,
		    IAS_WEB_DOC_PKG.GET_DOC_GUID(RT_BILL_NO, AD_DATE, 5, BRN_USR, 80) GUID,
		    TO_CHAR(AD_DATE,''DD/MM/YYYY HH24:MI:SS'') AD_DATE,
		    ys_gen_pkg.Get_Fld_Value(''IAS_RT_SALES_TYPES'',''TAX_ACTV_CODE'' , '' WHERE SR_TYPE=''||SR_TYPE) TAX_ACTV_CODE,
		    NULL DOC_PST_SQ,
		    NULL DOC_HASH,
		    IAS_WEB_DOC_PKG.Get_Doc_qr_code( p_sys_no	 => '||p_sys_no||',
						     p_brn_no	 => brn_no,
						     p_doc_type  => '||p_doc_type||',
						     p_doc_ser	 => rt_bill_srl,
						     p_uuid	 => web_srvc_uuid) QR,
		    CUST_CODE C_CODE_CSH,
		    BILL_NO BILL_NO_MNL
	    FROM YSPOS'||P_ACTV_NO||'.IAS_POS_RT_BILL_MST
	    WHERE 1=1 '||p_whr||'
	    union all
	    SELECT
		    RT_BILL_TYPE RT_BILL_DOC_TYPE,
		    RT_BILL_NO,
		    TO_CHAR(RT_BILL_NO) RT_BILL_SER,
		    TO_CHAR(RT_BILL_DATE,''DD/MM/YYYY'') RT_BILL_DATE,
		    A_CY RT_BILL_CURRENCY,
		    round(RT_BILL_RATE,15) RT_BILL_RATE,
		    C_CODE,
		    NULL C_NAME,
		    AC_CODE A_CODE,
		    CHEQUE_NO,
		    CHEQUE_AMT,
		    TO_CHAR(CHEQUE_DUE_DATE,''DD/MM/YYYY'') CHEQUE_DUE_DATE,
		    ROUND(DISC_AMT,15) DISC_AMT,
		    ROUND(DISC_AMT_MST,15) DISC_AMT_MST,
		    ROUND(OTHR_AMT,15) OTHR_AMT,
		    ROUND(VAT_AMT,15) VAT_AMT,
		    ROUND(RT_BILL_AMT,15) BILL_AMT,
		    W_CODE,
		    NULL R_CODE,
		    REP_CODE,
		    CASH_NO,
		    CC_CODE_BILL,
		    SR_TYPE,
		    NULL ACTV_NO,
		    RT_BILL_NOTE A_DESC,
		    MOBILE_NO C_TEL,
		    NULL DRIVER_NO,
		    BRN_NO,
		    BRN_YEAR,
		    BRN_USR,
		    ys_gen_pkg.Get_Flg_Nm (''TYPE_NAME_SI'',RT_BILL_TYPE ,'||p_lang_no||') RT_BILL_DOC_TYPE_NAME,
		    IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')WC_NAME,
		    NULL R_NAME,
		    NULL REP_NAME,
		    DECODE(RT_BILL_TYPE,
			       1, ys_gen_pkg.Get_Fld_Value(''CASH_IN_HAND'', DECODE('||p_lang_no||',1,''CASH_NAME'',''NVL(CASH_E_NAME,CASH_NAME)''), '' WHERE CASH_NO=''||CASH_NO),
			       2, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
			       3, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
				NULL) CASH_NO,
		    IAS_CC_CODE_PKG.GET_CC_NAME(CC_CODE_BILL, '||p_lang_no||') CC_NAME,
		    ys_gen_pkg.Get_Fld_Value(''IAS_SALES_TYPES'', DECODE('||p_lang_no||',1,''SI_A_NAME'',''NVL(SI_E_NAME,SI_A_NAME)''), '' WHERE SI_TYPE=''||SR_TYPE) SR_NAME,
		    IAS_WEB_DOC_PKG.GET_DOC_GUID(RT_BILL_NO, AD_DATE, 5, BRN_USR, 80) GUID,
		    TO_CHAR(AD_DATE,''DD/MM/YYYY HH24:MI:SS'') AD_DATE,
		    ys_gen_pkg.Get_Fld_Value(''IAS_RT_SALES_TYPES'',''TAX_ACTV_CODE'' , '' WHERE SR_TYPE=''||SR_TYPE) TAX_ACTV_CODE,
		    NULL DOC_PST_SQ,
		    NULL DOC_HASH,
		    IAS_WEB_DOC_PKG.Get_Doc_qr_code( p_sys_no	 => '||p_sys_no||',
						     p_brn_no	 => brn_no,
						     p_doc_type  => '||p_doc_type||',
						     p_doc_ser	 => rt_bill_srl,
						     p_uuid	 => web_srvc_uuid) QR,
		    CUST_CODE C_CODE_CSH,
		    BILL_NO BILL_NO_MNL
	    FROM YSPOS'||P_ACTV_NO||'.IAS_POS_HST_RT_BILL_MST IAS_POS_RT_BILL_MST
	    WHERE 1=1 '||p_whr||'
	    ORDER BY RT_BILL_NO';
	elsif nvl(p_sys_no,0)=87 then
	    open p_ref_cur for '
	    SELECT
		    RT_BILL_DOC_TYPE,
		    RT_BILL_NO,
		    TO_CHAR(RT_BILL_SRL) RT_BILL_SER,
		    TO_CHAR(RT_BILL_DATE,''DD/MM/YYYY'') RT_BILL_DATE,
		    A_CY RT_BILL_CURRENCY,
		    round(RT_BILL_RATE,15) RT_BILL_RATE,
		    C_CODE,
		    IAS_CST_PKG.GET_C_NAME(C_CODE, '||p_lang_no||') C_NAME,
		    AC_CODE A_CODE,
		    CHQ_NO CHEQUE_NO,
		    CHQ_AMT CHEQUE_AMT,
		    TO_CHAR(CHQ_DUE_DATE,''DD/MM/YYYY'') CHEQUE_DUE_DATE,
		    ROUND(DISC_AMT,15) DISC_AMT,
		    ROUND(DISC_AMT_MST,15) DISC_AMT_MST,
		    ROUND(OTHR_AMT,15) OTHR_AMT,
		    ROUND(VAT_AMT,15)  VAT_AMT,
		    ROUND(RT_BILL_AMT,15) BILL_AMT,
		    W_CODE,
		    RGN_NO,
		    --REP_CODE,
		    CASH_NO,
		    CC_CODE,
		    SR_TYPE,
		    --ACTV_NO,
		    RT_BILL_NOTE A_DESC,
		    MOBILE_NO,
		    --DRIVER_NO,
		    BRN_NO,
		    BRN_YEAR,
		    BRN_USR,
		    ys_gen_pkg.Get_Flg_Nm (''TYPE_NAME_SI'',RT_BILL_DOC_TYPE ,'||p_lang_no||') RT_BILL_DOC_TYPE_NAME,
		    IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')WC_NAME,
		    ys_gen_pkg.Get_Fld_Value(''REGIONS'', DECODE('||p_lang_no||',1,''R_A_NAME'',''NVL(R_E_NAME,R_A_NAME)''), '' WHERE R_CODE=''||RGN_NO) R_NAME,
		    --IAS_SMAN_PKG.Get_Sman_Name(REP_CODE,'||p_lang_no||') REP_NAME,
		    DECODE(RT_BILL_DOC_TYPE,
			       1, ys_gen_pkg.Get_Fld_Value(''CASH_IN_HAND'', DECODE('||p_lang_no||',1,''CASH_NAME'',''NVL(CASH_E_NAME,CASH_NAME)''), '' WHERE CASH_NO=''||CASH_NO),
			       2, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
			       3, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
				NULL) CASH_NO,
		    IAS_CC_CODE_PKG.GET_CC_NAME(CC_CODE, '||p_lang_no||') CC_NAME,
		    ys_gen_pkg.Get_Fld_Value(''IAS_SALES_TYPES'', DECODE('||p_lang_no||',1,''SI_A_NAME'',''NVL(SI_E_NAME,SI_A_NAME)''), '' WHERE SI_TYPE=''||SR_TYPE) SR_NAME,
		    IAS_WEB_DOC_PKG.GET_DOC_GUID(RT_BILL_SRL, AD_DATE, 5, BRN_USR, 87) GUID,
		    TO_CHAR(AD_DATE,''DD/MM/YYYY HH24:MI:SS'') AD_DATE,
		    ys_gen_pkg.Get_Fld_Value(''IAS_RT_SALES_TYPES'',''TAX_ACTV_CODE'' , '' WHERE SR_TYPE=''||SR_TYPE) TAX_ACTV_CODE,
		    NULL DOC_PST_SQ,
		    NULL DOC_HASH,
		    IAS_WEB_DOC_PKG.Get_Doc_qr_code( p_sys_no	 => '||p_sys_no||',
						   p_brn_no    => brn_no,
						   p_doc_type  => '||p_doc_type||',
						   p_doc_ser   => bill_srl,
						   p_uuid      => web_srvc_uuid) QR
	    FROM YSRMS'||P_ACTV_NO||'.RMS_RT_BILL_MST
	    WHERE 1=1 '||p_whr||'
	    union all
	    SELECT
		    RT_BILL_DOC_TYPE,
		    RT_BILL_NO,
		    TO_CHAR(RT_BILL_SRL) RT_BILL_SER,
		    TO_CHAR(RT_BILL_DATE,''DD/MM/YYYY'') RT_BILL_DATE,
		    A_CY RT_BILL_CURRENCY,
		    round(RT_BILL_RATE,15) RT_BILL_RATE,
		    C_CODE,
		    IAS_CST_PKG.GET_C_NAME(C_CODE, '||p_lang_no||') C_NAME,
		    AC_CODE A_CODE,
		    CHQ_NO CHEQUE_NO,
		    CHQ_AMT CHEQUE_AMT,
		    TO_CHAR(CHQ_DUE_DATE,''DD/MM/YYYY'') CHEQUE_DUE_DATE,
		    ROUND(DISC_AMT,15) DISC_AMT,
		    ROUND(DISC_AMT_MST,15) DISC_AMT_MST,
		    ROUND(OTHR_AMT,15) OTHR_AMT,
		    ROUND(VAT_AMT,15)  VAT_AMT,
		    ROUND(RT_BILL_AMT,15) BILL_AMT,
		    W_CODE,
		    RGN_NO,
		    --REP_CODE,
		    CASH_NO,
		    CC_CODE,
		    SR_TYPE,
		    --ACTV_NO,
		    RT_BILL_NOTE A_DESC,
		    MOBILE_NO,
		    --DRIVER_NO,
		    BRN_NO,
		    BRN_YEAR,
		    BRN_USR,
		    ys_gen_pkg.Get_Flg_Nm (''TYPE_NAME_SI'',RT_BILL_DOC_TYPE ,'||p_lang_no||') RT_BILL_DOC_TYPE_NAME,
		    IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')WC_NAME,
		    ys_gen_pkg.Get_Fld_Value(''REGIONS'', DECODE('||p_lang_no||',1,''R_A_NAME'',''NVL(R_E_NAME,R_A_NAME)''), '' WHERE R_CODE=''||RGN_NO) R_NAME,
		    --IAS_SMAN_PKG.Get_Sman_Name(REP_CODE,'||p_lang_no||') REP_NAME,
		    DECODE(RT_BILL_DOC_TYPE,
			       1, ys_gen_pkg.Get_Fld_Value(''CASH_IN_HAND'', DECODE('||p_lang_no||',1,''CASH_NAME'',''NVL(CASH_E_NAME,CASH_NAME)''), '' WHERE CASH_NO=''||CASH_NO),
			       2, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
			       3, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
				NULL) CASH_NO,
		    IAS_CC_CODE_PKG.GET_CC_NAME(CC_CODE, '||p_lang_no||') CC_NAME,
		    ys_gen_pkg.Get_Fld_Value(''IAS_SALES_TYPES'', DECODE('||p_lang_no||',1,''SI_A_NAME'',''NVL(SI_E_NAME,SI_A_NAME)''), '' WHERE SI_TYPE=''||SR_TYPE) SR_NAME,
		    IAS_WEB_DOC_PKG.GET_DOC_GUID(RT_BILL_SRL, AD_DATE, 5, BRN_USR, 87) GUID,
		    TO_CHAR(AD_DATE,''DD/MM/YYYY HH24:MI:SS'') AD_DATE,
		    ys_gen_pkg.Get_Fld_Value(''IAS_RT_SALES_TYPES'',''TAX_ACTV_CODE'' , '' WHERE SR_TYPE=''||SR_TYPE) TAX_ACTV_CODE,
		    NULL DOC_PST_SQ,
		    NULL DOC_HASH,
		    IAS_WEB_DOC_PKG.Get_Doc_qr_code( p_sys_no	 => '||p_sys_no||',
						   p_brn_no    => brn_no,
						   p_doc_type  => '||p_doc_type||',
						   p_doc_ser   => bill_srl,
						   p_uuid      => web_srvc_uuid) QR
	    FROM YSRMS'||P_ACTV_NO||'.RMS_HST_RT_BILL_MST RMS_RT_BILL_MST
	    WHERE 1=1 '||p_whr||'
	    ORDER BY RT_BILL_NO';
	end if;
    elsif p_doc_type = 15 then
	open p_ref_cur for '
	SELECT
	    ys_gen_pkg.Get_Fld_Value(''IAS_AR_TYPS'', DECODE('||p_lang_no||',1,''TYP_L_NM'',''NVL(TYP_F_NM,TYP_L_NM)''), '' WHERE AR_TYPE_NO=8 AND TYP_NO=''||ADD_DISC_TYPE) SI_NAME,
	    DOC_NO,
	    TO_CHAR(DOC_SER) DOC_SER,
	    TO_CHAR(DOC_DATE,''DD/MM/YYYY'') DOC_DATE,
	    A_CODE,
	    A_CY,
	    ROUND(DOC_RATE,15) DOC_RAE,
	    REF_NO,
	    BILL_NO,
	    BILL_SER,
	    TO_CHAR(BILL_DATE,''DD/MM/YYYY'') BILL_DATE,
	    C_CODE,
	    IAS_CST_PKG.GET_C_NAME(C_CODE,'||p_lang_no||') C_NAME,
	    W_CODE,
	    IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')W_NAME,
	    CASH_NO,
	    DECODE(BILL_DOC_TYPE,
		    1, ys_gen_pkg.Get_Fld_Value(''CASH_IN_HAND'', DECODE('||p_lang_no||',1,''CASH_NAME'',''NVL(CASH_E_NAME,CASH_NAME)''), '' WHERE CASH_NO=''||CASH_NO),
		    2, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
		    3, ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||CASH_NO),
		    NULL) CASH_NAME,
	    CC_CODE,
	    IAS_CC_CODE_PKG.GET_CC_NAME(CC_CODE, '||p_lang_no||') CC_NAME,
	    PJ_NO,
	    ACTV_NO,
	    NVL(ADD_DISC_AMT_DTL,0)+NVL(ADD_DISC_AMT_MST,0) DISC_AMT,
	    --ADD_VAT_AMT,
	    (SELECT ROUND(SUM(NET_QTY*(NVL(VAT_AMT,0))),15)
		 FROM IAS_BILL_DTL_ADD_DISC B
		 WHERE B.DOC_SER=A.DOC_SER) VAT_AMT,
	    BRN_NO,
	    BRN_USR,
	    BILL_DOC_TYPE,
	    ys_gen_pkg.Get_Flg_Nm (''TYPE_NAME_SI'',BILL_DOC_TYPE ,'||p_lang_no||') BILL_DOC_TYPE_NAME,
	    /*(SELECT SUM(NET_QTY*(PRICE_AFTER_DISC+NVL(ADD_VAT_AMT,0)))
		 FROM IAS_BILL_DTL_ADD_DISC B
		 WHERE B.DOC_SER=A.DOC_SER)*/
	    (SELECT SUM(NET_QTY*(PRICE_AFTER_DISC+NVL(VAT_AMT,0)+nvl(ADD_DIS_AMT_DTL,0)))
		 FROM IAS_BILL_DTL_ADD_DISC B
		 WHERE B.DOC_SER=A.DOC_SER) BILL_AMT,
	    IAS_WEB_DOC_PKG.GET_DOC_GUID(DOC_SER, AD_DATE, 15, BRN_USR, 80) GUID,
	    TO_CHAR(AD_DATE,''DD/MM/YYYY HH24:MI:SS'') AD_DATE,
	    DOC_PST_SQ,
	    DOC_HASH,
	    ys_gen_pkg.Get_Fld_Value(''IAS_SALES_TYPES'',''TAX_ACTV_CODE'' , '' WHERE SI_TYPE=''||(select si_type from ias_bill_mst where bill_ser = a.bill_ser)) TAX_ACTV_CODE,
	    CASE NOTE_TYP
		WHEN 1 THEN ''C''
		WHEN -1 THEN ''D''
		END NOTE_TYPE,
	    IAS_WEB_DOC_PKG.Get_Doc_qr_code( p_sys_no	 => '||p_sys_no||',
						   p_brn_no    => brn_no,
						   p_doc_type  => '||p_doc_type||',
						   p_doc_ser   => doc_Ser,
						   p_uuid      => web_srvc_uuid) QR
	FROM IAS_BILL_MST_ADD_DISC A
	WHERE 1=1 '||p_whr||'
	ORDER BY DOC_DATE,DOC_NO
	';
    elsif p_doc_type = 500 then
	open p_ref_cur for 'SELECT
		      M.DOC_NO,
		      TO_CHAR(M.DOC_SRL) DOC_SRL,
		      TO_CHAR(M.DOC_DATE, ''DD/MM/YYYY'') DOC_DATE,
		      TO_CHAR(M.F_DATE_AD,''DD/MM/YYYY'') F_DATE_AD,
		      TO_CHAR(M.T_DATE_AD,''DD/MM/YYYY'') T_DATE_AD,
		      M.FRST_PRTY ,
		      REM_GEN_PKG.GET_OWNR_NAME(M.FRST_PRTY,'||p_lang_no||') FRST_PRTY_NM,
		      M.SCND_PRTY ,
		      IAS_CST_PKG.GET_C_NAME(M.SCND_PRTY,'||p_lang_no||') SCND_PRTY_NM,
		      NVL((SELECT ROUND(SUM(NVL(D.RNT_AMT ,0)),15)     FROM REM_CNTRCT_RNT_DTL D WHERE M.DOC_SRL=D.DOC_SRL ),0) RNT_AMT,
		      NVL((SELECT ROUND(SUM(NVL(D.VAT_AMT ,0)),15)     FROM REM_CNTRCT_RNT_DTL D WHERE M.DOC_SRL=D.DOC_SRL ),0) VAT_AMT,
		      NVL((SELECT ROUND(SUM(NVL(D.DIS_AMT_DTL ,0)),15) FROM REM_CNTRCT_RNT_DTL D WHERE M.DOC_SRL=D.DOC_SRL ),0) DIS_AMT_DTL,
		      M.CUR_CODE,
		      ROUND(M.EX_RATE,15) EX_RATE,
		      M.ACTV_NO,
		      M.CC_CODE,
		      M.DOC_DSC,
		      M.REF_NO,
		      M.CMP_NO,
		      M.BRN_NO,
		      M.BRN_YEAR,
		      M.BRN_USR,
		      IAS_CC_CODE_PKG.GET_CC_NAME(M.CC_CODE, '||p_lang_no||') CC_NAME,
		      UTL_RAW.CAST_TO_VARCHAR2(
		      UTL_ENCODE.BASE64_ENCODE(
			   UTL_RAW.CAST_TO_RAW((M.BRN_USR||'';''||
						     ORA_HASH(M.DOC_SRL||TO_CHAR(M.AD_DATE,''DD/MM/YYYY HH24:MI:SS''))||'';''||
						     0||'';0'')))) GUID,
		      TO_CHAR(M.AD_DATE,''DD/MM/YYYY HH24:MI:SS'') AD_DATE
		FROM REM_CNTRCT_RNT_MST M
		WHERE 1=1
		'||p_whr||'
		ORDER BY M.DOC_NO';
    elsif p_doc_type = 501 then
	open p_ref_cur for 'SELECT
		      M.DOC_NO,
		      TO_CHAR(M.DOC_SRL) DOC_SRL,
		      TO_CHAR(M.DOC_DATE, ''DD/MM/YYYY'') DOC_DATE,
		      M.SCND_PRTY ,
		      IAS_CST_PKG.GET_C_NAME(M.SCND_PRTY,''||p_lang_no||'') SCND_PRTY_NM,
		      NVL((SELECT ROUND(SUM(NVL(D.AMT_DUE ,0)),15)  FROM REM_PRMTING_PRIOD_DTL D WHERE M.DOC_SRL=D.DOC_SRL ),0) AMT_DUE,
		      NVL((SELECT ROUND(SUM(NVL(D.VAT_AMT ,0)),15)  FROM REM_PRMTING_PRIOD_DTL D WHERE M.DOC_SRL=D.DOC_SRL ),0) VAT_AMT,
		      M.CUR_CODE,
		      ROUND(M.EX_RATE,15) EX_RATE,
		      M.ACTV_NO,
		      M.CC_CODE,
		      M.DOC_DSC,
		      M.REF_NO,
		      M.CMP_NO,
		      M.BRN_NO,
		      M.BRN_YEAR,
		      M.BRN_USR,
		      IAS_CC_CODE_PKG.GET_CC_NAME(M.CC_CODE, '||p_lang_no||') CC_NAME,
		      UTL_RAW.CAST_TO_VARCHAR2(
		      UTL_ENCODE.BASE64_ENCODE(
			   UTL_RAW.CAST_TO_RAW((M.BRN_USR||'';''||
						     ORA_HASH(M.DOC_SRL||TO_CHAR(M.AD_DATE,''DD/MM/YYYY HH24:MI:SS''))||'';''||
						     0||'';0'')))) GUID,
		      TO_CHAR(M.AD_DATE,''DD/MM/YYYY HH24:MI:SS'') AD_DATE
		FROM REM_PRMTING_PRIOD_MST M
		WHERE 1=1
		'||p_whr||'
		ORDER BY M.DOC_NO';
    elsif p_doc_type = 502 then
	open p_ref_cur for '';
    elsif p_doc_type = 503 then
	open p_ref_cur for 'SELECT
		      M.DOC_NO,
		      TO_CHAR(M.DOC_SRL) DOC_SRL,
		      TO_CHAR(M.DOC_DATE, ''DD/MM/YYYY'') DOC_DATE,
		      D.C_CODE ,
		      IAS_CST_PKG.GET_C_NAME(D.C_CODE,'||p_lang_no||') C_CODE_NM,
		      ROUND(SUM(NVL(D.AMT ,0)),15)     AMT,
		      ROUND(SUM(NVL(D.VAT_AMT ,0)),15) VAT_AMT,
		      M.CUR_CODE,
		      ROUND(M.EX_RATE,15) EX_RATE,
		      M.ACTV_NO,
		      M.CC_CODE,
		      M.DOC_DSC,
		      M.REF_NO,
		      M.CMP_NO,
		      M.BRN_NO,
		      M.BRN_YEAR,
		      M.BRN_USR,
		      IAS_CC_CODE_PKG.GET_CC_NAME(M.CC_CODE, '||p_lang_no||') CC_NAME,
		      UTL_RAW.CAST_TO_VARCHAR2(
		      UTL_ENCODE.BASE64_ENCODE(
			   UTL_RAW.CAST_TO_RAW((M.BRN_USR||'';''||
						     ORA_HASH(M.DOC_SRL||TO_CHAR(M.AD_DATE,''DD/MM/YYYY HH24:MI:SS''))||'';''||
						     0||'';0'')))) GUID,
		      TO_CHAR(M.AD_DATE,''DD/MM/YYYY HH24:MI:SS'') AD_DATE
		FROM  REM_BILL_MST M,REM_BILL_DTL D
		WHERE M.DOC_SRL=D.DOC_SRL
		 '||p_whr||'
		GROUP BY
		      M.DOC_NO,
		      M.DOC_SRL,
		      M.DOC_DATE,
		      D.C_CODE ,
		      M.CUR_CODE,
		      M.EX_RATE,
		      M.ACTV_NO,
		      M.CC_CODE,
		      M.DOC_DSC,
		      M.REF_NO,
		      M.CMP_NO,
		      M.BRN_NO,
		      M.BRN_YEAR,
		      M.BRN_USR,
		      M.AD_DATE
		ORDER BY M.DOC_NO';
    elsif p_doc_type = 525 then
	open p_ref_cur for 'SELECT
		      M.DOC_NO,
		      TO_CHAR(M.DOC_SRL) DOC_SRL,
		      TO_CHAR(M.DOC_DATE, ''DD/MM/YYYY'') DOC_DATE,
		      M.SCND_PRTY ,
		      IAS_CST_PKG.GET_C_NAME(M.SCND_PRTY,'||p_lang_no||') SCND_PRTY_NM,
		      NVL((SELECT ROUND(SUM(NVL(D.BATCH_AMT ,0)),15)	 FROM REM_BILL_RNT_DTL D WHERE M.DOC_SRL=D.DOC_SRL ),0) BATCH_AMT,
		      NVL((SELECT ROUND(SUM(NVL(D.VAT_AMT ,0)),15)	 FROM REM_BILL_RNT_DTL D WHERE M.DOC_SRL=D.DOC_SRL ),0) VAT_AMT,
		      NVL((SELECT ROUND(SUM(NVL(D.DIS_AMT_DTL ,0)),15)	 FROM REM_BILL_RNT_DTL D WHERE M.DOC_SRL=D.DOC_SRL ),0) DIS_AMT_DTL,
		      NVL((SELECT ROUND(SUM(NVL(D.DIS_AMT_BILL ,0)),15)  FROM REM_BILL_RNT_DTL D WHERE M.DOC_SRL=D.DOC_SRL ),0) DIS_AMT_BILL,
		      M.CUR_CODE,
		      ROUND(M.EX_RATE,15) EX_RATE,
		      M.ACTV_NO,
		      M.CC_CODE,
		      M.DOC_DSC,
		      M.REF_NO,
		      M.CMP_NO,
		      M.BRN_NO,
		      M.BRN_YEAR,
		      M.BRN_USR,
		      IAS_CC_CODE_PKG.GET_CC_NAME(M.CC_CODE, '||p_lang_no||') CC_NAME,
		      UTL_RAW.CAST_TO_VARCHAR2(
		      UTL_ENCODE.BASE64_ENCODE(
			   UTL_RAW.CAST_TO_RAW((M.BRN_USR||'';''||
						     ORA_HASH(M.DOC_SRL||TO_CHAR(M.AD_DATE,''DD/MM/YYYY HH24:MI:SS''))||'';''||
						     0||'';0'')))) GUID,
		      TO_CHAR(M.AD_DATE,''DD/MM/YYYY HH24:MI:SS'') AD_DATE
		FROM REM_BILL_RNT_MST M
		WHERE 1=1
		'||p_whr||'
		ORDER BY M.DOC_NO';
    end if;

    <<prc_end>>
    if v_msg_txt is not null then
	p_error := v_msg_txt ||chr(10)||'On line: '||v_err_line;
    end if;
End GetDocMst;


procedure GetDocDtl(p_doc_type	in  number,
		    p_lang_no	in  number,
		    p_doc_Ser	in  number,
		    p_ref_cur	out sys_refcursor,
		    p_error	out varchar2,
		    p_actv_no  in  number,
		    p_sys_no	in number)
as
v_msg_txt   varchar2(4000);
v_pkg_line  varchar2(4000);
v_err_line  varchar2(4000);
begin
    if p_doc_type is null then
	v_err_line := $$plsql_line;
	v_msg_txt := 'Parameter p_doc_type is null';
	goto prc_end;
    end if;

    if p_doc_type = 2 then
	open p_ref_cur for '
	    SELECT
	       A_CODE,
	       IAS_ACODE_PKG.GET_A_NAME(A_CODE,'||p_lang_no||') A_NAME,
	       DECODE(AC_DTL_TYP,1,AC_CODE_DTL,NULL) CASH_NO,
	       DECODE(AC_DTL_TYP,1,ys_gen_pkg.Get_Fld_Value(''CASH_IN_HAND'', DECODE('||p_lang_no||',1,''CASH_NAME'',''NVL(CASH_E_NAME,CASH_NAME)''), '' WHERE CASH_NO=''||AC_CODE_DTL))CASH_NAME,
	       DECODE(AC_DTL_TYP,2,AC_CODE_DTL,NULL) BANK_NO,
	       DECODE(AC_DTL_TYP,2,ys_gen_pkg.Get_Fld_Value(''CASH_AT_BANK'', DECODE('||p_lang_no||',1,''BANK_NAME'',''NVL(BANK_E_NAME,BANK_NAME)''), '' WHERE BANK_NO=''||AC_CODE_DTL))BANK_NAME,
	       DECODE(AC_DTL_TYP,3,AC_CODE_DTL,NULL) C_CODE,
	       DECODE(AC_DTL_TYP,3,IAS_CST_PKG.GET_C_NAME(AC_CODE_DTL, '||p_lang_no||'))C_NAME,
	       DECODE(AC_DTL_TYP,4,AC_CODE_DTL,NULL) V_CODE,
	       DECODE(AC_DTL_TYP,4,IAS_VNDR_PKG.GET_V_NAME(AC_CODE_DTL, '||p_lang_no||'))V_NAME,
	       AC_DESC,
	       ABS(nvl(AC_AMTF,AC_AMT)) AMT,
	       A_CY,
	       EX_RATE,
	       CC_CODE,
	       IAS_CC_CODE_PKG.GET_CC_NAME(CC_CODE, '||p_lang_no||') CC_NAME,
	       PJ_NO,
	       ACTV_NO,
	       CHEQUE_NO,
	       TO_CHAR(VALUE_DATE,''DD/MM/YYYY'') VALUE_DATE,
	       RCRD_NO,
	       AC_DTL_TYP,
	       AC_CODE_DTL,
	       IAS_Acode_Pkg.Get_Ac_Dtl_Nm( P_AC_Code_Dtl => ac_code_dtl,
					    P_AC_CODE	 => a_Code,
					    P_Ac_Dtl_Typ =>ac_dtl_typ,
					    P_Lng_No	 => 1,
					    P_get_nm_only => null) AC_CODE_DTL_NAME,
	       Ref_no
	    FROM GLS_V_VCHR_DTL_YR
	    WHERE V_SER='||p_doc_ser||'
	    ORDER BY RCRD_NO
	';
    elsif p_doc_type = 4 then
	if nvl(p_sys_no,0) = 61 then
	    open p_ref_cur for '
		SELECT
		    BILL_DOC_TYPE,
		    BILL_NO,
		    TO_CHAR(BILL_SER),
		    I_CODE,
		    IAS_ITM_PKG.GET_ITM_NAME(I_CODE,'||p_lang_no||') I_NAME,
		    /*NVL(IAS_ITM_PKG.GET_GTIN_CODE(I_CODE),I_CODE) GTIN_CODE,*/
		    (select gtin_code from ias_itm_mst where i_code=IAS_V_BILL_DTL_YR.i_code) GTIN_CODE,
		    (select hsn_code from ias_itm_mst where i_code=IAS_V_BILL_DTL_YR.i_code) HSN_CODE,
		    I_QTY,
		    ITM_UNT,
		    (SELECT NVL(MEASURE_CODE_GB,MEASURE_CODE_GB) FROM MEASUREMENT WHERE MEASURE_CODE = IAS_V_BILL_DTL_YR.ITM_UNT) ITM_UNT_GB,
		    ROUND(I_PRICE,15) I_PRICE,
		    ROUND(I_PRICE_VAT,15) I_PRICE_VAT,
		    W_CODE,
		    IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')W_NAME,
		    CC_CODE,
		    IAS_CC_CODE_PKG.GET_CC_NAME(CC_CODE, '||p_lang_no||') CC_NAME,
		    TO_CHAR(EXPIRE_DATE,''DD/MM/YYYY'') EXPIRE_DATE,
		    BATCH_NO,
		    FREE_QTY,
		    ROUND(DIS_AMT/I_PRICE*100,15) DIS_PER,
		    ROUND(DIS_AMT_DTL,15) DIS_AMT_DTL,
		    ROUND(DIS_AMT_MST,15) DIS_AMT_MST,
		    ROUND(DIS_AMT_DTL2,15) DIS_AMT_DTL2,
		    ROUND(DIS_AMT_DTL3,15) DIS_AMT_DTL3,
		    ROUND(DIS_AMT,15) DIS_AMT,
		    VAT_PER,
		    ROUND(NVL(VAT_AMT,0) + NVL(VAT_AMT_OTHR,0),15) VAT_AMT,
		    ROUND(OTHR_AMT,15) OTHR_AMT,
		    RCRD_NO,
		    ITEM_DESC,
		    BARCODE,
		    IAS_ITM_PKG.GET_ITM_NAME(I_CODE,2) I_E_NAME
		FROM IAS_V_BILL_DTL_YR
		WHERE BILL_SER='||p_doc_Ser||'
		ORDER BY RCRD_NO';
	elsif nvl(p_sys_no,0) = 80  then
	    open p_ref_cur for '
		SELECT
		    null BILL_TYPE,
		    BILL_NO,
		    TO_CHAR(bill_no) BILL_SER,
		    I_CODE,
		    (select gtin_code from ias_itm_mst where i_code=IAS_POS_BILL_DTL.i_code) GTIN_CODE,
		    (select hsn_code from ias_itm_mst where i_code=IAS_POS_BILL_DTL.i_code) HSN_CODE,
		    IAS_ITM_PKG.GET_ITM_NAME(I_CODE,'||p_lang_no||') I_NAME,
		    I_QTY,
		    ITM_UNT,
		    (SELECT NVL(MEASURE_CODE_GB,MEASURE_CODE_GB) FROM MEASUREMENT WHERE MEASURE_CODE = IAS_POS_BILL_DTL.ITM_UNT) ITM_UNT_GB,
		    ROUND(I_PRICE,15) I_PRICE,
		    ROUND(I_PRICE_VAT,15) I_PRICE_VAT,
		    W_CODE,
		    IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')W_NAME,
		    null CC_CODE,
		    null CC_NAME,
		    TO_CHAR(EXPIRE_DATE,''DD/MM/YYYY'') EXPIRE_DATE,
		    BATCH_NO,
		    FREE_QTY,
		    DIS_PER,
		    ROUND(DIS_AMT,15) DIS_AMT,
		    VAT_PER,
		    ROUND(VAT_AMT,15) VAT_AMT,
		    ROUND(OTHR_AMT,15) OTHR_AMT,
		    RCRD_NO,
		    null ITEM_DESC,
		    BARCODE,
		    IAS_ITM_PKG.GET_ITM_NAME(I_CODE,2) I_E_NAME
		FROM YSPOS'||p_actv_no||'.IAS_POS_BILL_DTL
		WHERE 1=1 AND BILL_NO = '||p_doc_Ser||'
		union all
		SELECT
		    null BILL_TYPE,
		    BILL_NO,
		    TO_CHAR(bill_no) BILL_SER,
		    I_CODE,
		    (select gtin_code from ias_itm_mst where i_code=IAS_POS_BILL_DTL.i_code) GTIN_CODE,
		    (select hsn_code from ias_itm_mst where i_code=IAS_POS_BILL_DTL.i_code) HSN_CODE,
		    IAS_ITM_PKG.GET_ITM_NAME(I_CODE,'||p_lang_no||') I_NAME,
		    I_QTY,
		    ITM_UNT,
		    (SELECT NVL(MEASURE_CODE_GB,MEASURE_CODE_GB) FROM MEASUREMENT WHERE MEASURE_CODE = IAS_POS_BILL_DTL.ITM_UNT) ITM_UNT_GB,
		    ROUND(I_PRICE,15) I_PRICE,
		    ROUND(I_PRICE_VAT,15) I_PRICE_VAT,
		    W_CODE,
		    IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')W_NAME,
		    null CC_CODE,
		    null CC_NAME,
		    TO_CHAR(EXPIRE_DATE,''DD/MM/YYYY'') EXPIRE_DATE,
		    BATCH_NO,
		    FREE_QTY,
		    DIS_PER,
		    ROUND(DIS_AMT,15) DIS_AMT,
		    VAT_PER,
		    ROUND(VAT_AMT,15) VAT_AMT,
		    ROUND(OTHR_AMT,15) OTHR_AMT,
		    RCRD_NO,
		    null ITEM_DESC,
		    BARCODE,
		    IAS_ITM_PKG.GET_ITM_NAME(I_CODE,2) I_E_NAME
		FROM YSPOS'||p_actv_no||'.IAS_POS_HST_BILL_DTL IAS_POS_BILL_DTL
		WHERE 1=1 AND BILL_NO = '||p_doc_Ser||'
		ORDER BY RCRD_NO
	    ';
	elsif nvl(p_sys_no,0)=87 then
	    open p_ref_cur for '
		SELECT
		    null BILL_TYPE,
		    BILL_NO,
		    TO_CHAR(bill_srl) BILL_SER,
		    I_CODE,
		    (select gtin_code from ias_itm_mst where i_code=RMS_BILL_DTL.i_code) GTIN_CODE,
		    (select hsn_code from ias_itm_mst where i_code=RMS_BILL_DTL.i_code) HSN_CODE,
		    IAS_ITM_PKG.GET_ITM_NAME(I_CODE,'||p_lang_no||') I_NAME,
		    I_QTY,
		    ITM_UNT,
		    (SELECT NVL(MEASURE_CODE_GB,MEASURE_CODE_GB) FROM MEASUREMENT WHERE MEASURE_CODE = RMS_BILL_DTL.ITM_UNT) ITM_UNT_GB,
		    ROUND(I_PRICE,15) I_PRICE,
		    ROUND(I_PRICE_VAT,15) I_PRICE_VAT,
		    W_CODE,
		    IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')W_NAME,
		    null CC_CODE,
		    null CC_NAME,
		    TO_CHAR(EXPIRE_DATE,''DD/MM/YYYY'') EXPIRE_DATE,
		    BATCH_NO,
		    FREE_QTY,
		    DIS_PRCNT DIS_PER,
		    ROUND(DIS_AMT,15) DIS_AMT,
		    VAT_PRCNT VAT_PER,
		    ROUND(VAT_AMT,15) VAT_AMT,
		    ROUND(OTHR_AMT,15) OTHR_AMT,
		    RCRD_NO,
		    null ITM_DSC,
		    BARCODE,
		    IAS_ITM_PKG.GET_ITM_NAME(I_CODE,2) I_E_NAME
		FROM YSRMS'||p_actv_no||'.RMS_BILL_DTL
		WHERE 1=1 AND BILL_SRL = '||p_doc_Ser||'
		union all
		SELECT
		    null BILL_TYPE,
		    BILL_NO,
		    TO_CHAR(bill_srl) BILL_SER,
		    I_CODE,
		    (select gtin_code from ias_itm_mst where i_code=RMS_BILL_DTL.i_code) GTIN_CODE,
		    (select hsn_code from ias_itm_mst where i_code=RMS_BILL_DTL.i_code) HSN_CODE,
		    IAS_ITM_PKG.GET_ITM_NAME(I_CODE,'||p_lang_no||') I_NAME,
		    I_QTY,
		    ITM_UNT,
		    (SELECT NVL(MEASURE_CODE_GB,MEASURE_CODE_GB) FROM MEASUREMENT WHERE MEASURE_CODE = RMS_BILL_DTL.ITM_UNT) ITM_UNT_GB,
		    ROUND(I_PRICE,15) I_PRICE,
		    ROUND(I_PRICE_VAT,15) I_PRICE_VAT,
		    W_CODE,
		    IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')W_NAME,
		    null CC_CODE,
		    null CC_NAME,
		    TO_CHAR(EXPIRE_DATE,''DD/MM/YYYY'') EXPIRE_DATE,
		    BATCH_NO,
		    FREE_QTY,
		    DIS_PRCNT DIS_PER,
		    ROUND(DIS_AMT,15) DIS_AMT,
		    VAT_PRCNT VAT_PER,
		    ROUND(VAT_AMT,15) VAT_AMT,
		    ROUND(OTHR_AMT,15) OTHR_AMT,
		    RCRD_NO,
		    null ITM_DSC,
		    BARCODE,
		    IAS_ITM_PKG.GET_ITM_NAME(I_CODE,2) I_E_NAME
		FROM YSRMS'||p_actv_no||'.RMS_HST_BILL_DTL RMS_BILL_DTL
		WHERE 1=1 AND BILL_SRL = '||p_doc_Ser||'
		ORDER BY RCRD_NO';

	end if;
    elsif p_doc_type = 5 then
	if nvl(p_sys_no,0)=61 then
	    open p_ref_cur for '
	    SELECT
		I_CODE,
		IAS_ITM_PKG.GET_ITM_NAME(I_CODE,'||p_lang_no||') I_NAME,
		I_QTY,
		ITM_UNT,
		(SELECT NVL(MEASURE_CODE_GB,MEASURE_CODE_GB) FROM MEASUREMENT WHERE MEASURE_CODE = IAS_V_RT_BILL_DTL_YR.ITM_UNT) ITM_UNT_GB,
		(select gtin_code from ias_itm_mst where i_code=IAS_V_RT_BILL_DTL_YR.i_code) GTIN_CODE,
		(select hsn_code from ias_itm_mst where i_code=IAS_V_RT_BILL_DTL_YR.i_code) HSN_CODE,
		ROUND(I_PRICE,15) I_PRICE,
		ROUND(I_PRICE_VAT,15) I_PRICE_VAT,
		W_CODE,
		IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')W_NAME,
		CC_CODE,
		IAS_CC_CODE_PKG.GET_CC_NAME(CC_CODE, '||p_lang_no||') CC_NAME,
		TO_CHAR(EXPIRE_DATE,''DD/MM/YYYY'') EXPIRE_DATE,
		BATCH_NO,
		FREE_QTY,
		ROUND(DIS_AMT/I_PRICE*100,15) DIS_PER,
		ROUND(DIS_AMT_DTL,15) DIS_AMT_DTL,
		ROUND(DIS_AMT_MST,15) DIS_AMT_MST,
		ROUND(DIS_AMT_DTL2,15) DIS_AMT_DTL2,
		ROUND(DIS_AMT_DTL3,15) DIS_AMT_DTL3,
		ROUND(DIS_AMT,15) DIS_AMT,
		VAT_PER,
		ROUND(VAT_AMT,15) VAT_AMT,
		ROUND(OTHR_AMT,15) OTHR_AMT,
		RCRD_NO,
		ITEM_DESC,
		BARCODE,
		TO_CHAR(BILL_SER) BILL_SER,
		BILL_NO,
		IAS_ITM_PKG.GET_ITM_NAME(I_CODE,2) I_E_NAME
	    FROM IAS_V_RT_BILL_DTL_YR
	    WHERE RT_BILL_SER='||p_Doc_Ser||'
	    ORDER BY RCRD_NO';
	elsif nvl(p_sys_no,0)=80 then
	    open p_ref_cur for '
	    SELECT
		I_CODE,
		IAS_ITM_PKG.GET_ITM_NAME(I_CODE,'||p_lang_no||') I_NAME,
		I_QTY,
		ITM_UNT,
		(SELECT NVL(MEASURE_CODE_GB,MEASURE_CODE_GB) FROM MEASUREMENT WHERE MEASURE_CODE = IAS_POS_RT_BILL_DTL.ITM_UNT) ITM_UNT_GB,
		(select gtin_code from ias_itm_mst where i_code=IAS_POS_RT_BILL_DTL.i_code) GTIN_CODE,
		(select hsn_code from ias_itm_mst where i_code=IAS_POS_RT_BILL_DTL.i_code) HSN_CODE,
		ROUND(I_PRICE,15) I_PRICE,
		ROUND(I_PRICE_VAT,15) I_PRICE_VAT,
		W_CODE,
		IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')W_NAME,
		NULL CC_CODE,
		NULL CC_NAME,
		TO_CHAR(EXPIRE_DATE,''DD/MM/YYYY'') EXPIRE_DATE,
		BATCH_NO,
		FREE_QTY,
		DIS_PER,
		ROUND(DIS_AMT,15) DIS_AMT,
		VAT_PER,
		ROUND(VAT_AMT,15) VAT_AMT,
		ROUND(OTHR_AMT,15) OTHR_AMT,
		RCRD_NO,
		NULL ITEM_DESC,
		BARCODE,
		(SELECT BILL_NO FROM YSPOS'||P_ACTV_NO||'.IAS_POS_RT_BILL_MST WHERE RT_BILL_NO=IAS_POS_RT_BILL_DTL.RT_BILL_NO) BILL_SER,
		RT_BILL_NO,
		IAS_ITM_PKG.GET_ITM_NAME(I_CODE,2) I_E_NAME
	    FROM YSPOS'||P_ACTV_NO||'.IAS_POS_RT_BILL_DTL
	    WHERE RT_BILL_NO='||p_Doc_Ser||'
	    union all
	    SELECT
		I_CODE,
		IAS_ITM_PKG.GET_ITM_NAME(I_CODE,'||p_lang_no||') I_NAME,
		I_QTY,
		ITM_UNT,
		(SELECT NVL(MEASURE_CODE_GB,MEASURE_CODE_GB) FROM MEASUREMENT WHERE MEASURE_CODE = IAS_POS_RT_BILL_DTL.ITM_UNT) ITM_UNT_GB,
		(select gtin_code from ias_itm_mst where i_code=IAS_POS_RT_BILL_DTL.i_code) GTIN_CODE,
		(select hsn_code from ias_itm_mst where i_code=IAS_POS_RT_BILL_DTL.i_code) HSN_CODE,
		ROUND(I_PRICE,15) I_PRICE,
		ROUND(I_PRICE_VAT,15) I_PRICE_VAT,
		W_CODE,
		IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')W_NAME,
		NULL CC_CODE,
		NULL CC_NAME,
		TO_CHAR(EXPIRE_DATE,''DD/MM/YYYY'') EXPIRE_DATE,
		BATCH_NO,
		FREE_QTY,
		DIS_PER,
		ROUND(DIS_AMT,15) DIS_AMT,
		VAT_PER,
		ROUND(VAT_AMT,15) VAT_AMT,
		ROUND(OTHR_AMT,15) OTHR_AMT,
		RCRD_NO,
		NULL ITEM_DESC,
		BARCODE,
		(SELECT BILL_NO FROM YSPOS'||P_ACTV_NO||'.IAS_POS_HST_RT_BILL_MST WHERE RT_BILL_NO=IAS_POS_RT_BILL_DTL.RT_BILL_NO) BILL_SER,
		RT_BILL_NO,
		IAS_ITM_PKG.GET_ITM_NAME(I_CODE,2) I_E_NAME
	    FROM YSPOS'||P_ACTV_NO||'.IAS_POS_HST_RT_BILL_DTL IAS_POS_RT_BILL_DTL
	    WHERE RT_BILL_NO='||p_Doc_Ser||'
	    ORDER BY RCRD_NO';
	elsif nvl(p_sys_no,0)=87 then
	    open p_ref_cur for
	    'SELECT
		I_CODE,
		IAS_ITM_PKG.GET_ITM_NAME(I_CODE,'||p_lang_no||') I_NAME,
		I_QTY,
		ITM_UNT,
		(SELECT NVL(MEASURE_CODE_GB,MEASURE_CODE_GB) FROM MEASUREMENT WHERE MEASURE_CODE = RMS_RT_BILL_DTL.ITM_UNT) ITM_UNT_GB,
		(select gtin_code from ias_itm_mst where i_code=RMS_RT_BILL_DTL.i_code) GTIN_CODE,
		(select hsn_code from ias_itm_mst where i_code=RMS_RT_BILL_DTL.i_code) HSN_CODE,
		ROUND(I_PRICE,15) I_PRICE,
		ROUND(I_PRICE_VAT,15) I_PRICE_VAT,
		W_CODE,
		IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')W_NAME,
		CC_CODE,
		IAS_CC_CODE_PKG.GET_CC_NAME(CC_CODE, '||p_lang_no||') CC_NAME,
		TO_CHAR(EXPIRE_DATE,''DD/MM/YYYY'') EXPIRE_DATE,
		BATCH_NO,
		FREE_QTY,
		DIS_PRCNT,
		ROUND(DIS_AMT,15) DIS_AMT,
		VAT_PRCNT,
		ROUND(VAT_AMT,15) VAT_AMT,
		ROUND(OTHR_AMT,15) OTHR_AMT,
		RCRD_NO,
		ITM_DSC ITEM_DESC,
		BARCODE,
		TO_CHAR(BILL_SRL) BILL_SER,
		BILL_NO,
		IAS_ITM_PKG.GET_ITM_NAME(I_CODE,2) I_E_NAME
	    FROM YSRMS'||P_ACTV_NO||'.RMS_RT_BILL_DTL
	    WHERE RT_BILL_SRL='||p_doc_ser||'
	    union all
	    SELECT
		I_CODE,
		IAS_ITM_PKG.GET_ITM_NAME(I_CODE,'||p_lang_no||') I_NAME,
		I_QTY,
		ITM_UNT,
		(SELECT NVL(MEASURE_CODE_GB,MEASURE_CODE_GB) FROM MEASUREMENT WHERE MEASURE_CODE = RMS_RT_BILL_DTL.ITM_UNT) ITM_UNT_GB,
		(select gtin_code from ias_itm_mst where i_code=RMS_RT_BILL_DTL.i_code) GTIN_CODE,
		(select hsn_code from ias_itm_mst where i_code=RMS_RT_BILL_DTL.i_code) HSN_CODE,
		ROUND(I_PRICE,15) I_PRICE,
		ROUND(I_PRICE_VAT,15) I_PRICE_VAT,
		W_CODE,
		IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')W_NAME,
		CC_CODE,
		IAS_CC_CODE_PKG.GET_CC_NAME(CC_CODE, '||p_lang_no||') CC_NAME,
		TO_CHAR(EXPIRE_DATE,''DD/MM/YYYY'') EXPIRE_DATE,
		BATCH_NO,
		FREE_QTY,
		DIS_PRCNT,
		ROUND(DIS_AMT,15) DIS_AMT,
		VAT_PRCNT,
		ROUND(VAT_AMT,15) VAT_AMT,
		ROUND(OTHR_AMT,15) OTHR_AMT,
		RCRD_NO,
		ITM_DSC ITEM_DESC,
		BARCODE,
		TO_CHAR(BILL_SRL) BILL_SER,
		BILL_NO,
		IAS_ITM_PKG.GET_ITM_NAME(I_CODE,2) I_E_NAME
	    FROM YSRMS'||P_ACTV_NO||'.RMS_HST_RT_BILL_DTL RMS_RT_BILL_DTL
	    WHERE RT_BILL_SRL='||p_doc_ser||'
	    ORDER BY RCRD_NO';
	end if;
    elsif p_doc_type=15 then
	open p_ref_cur for '
	SELECT
	    I_CODE,
	    IAS_ITM_PKG.GET_ITM_NAME(I_CODE,'||p_lang_no||') I_NAME,
	    ADD_DIS_QTY I_QTY,
	    ITM_UNT,
	    (SELECT NVL(MEASURE_CODE_GB,MEASURE_CODE_GB) FROM MEASUREMENT WHERE MEASURE_CODE = IAS_BILL_DTL_ADD_DISC.ITM_UNT) ITM_UNT_GB,
	    (select gtin_code from ias_itm_mst where i_code=IAS_BILL_DTL_ADD_DISC.i_code) GTIN_CODE,
	    (select hsn_code from ias_itm_mst where i_code=IAS_BILL_DTL_ADD_DISC.i_code) HSN_CODE,
	    --ROUND(PRICE_AFTER_DISC+NVL(ADD_DIS_AMT_DTL,0)+NVL(ADD_VAT_AMT,0),2),
	    --ROUND(PRICE_AFTER_DISC,2),
	    ROUND(ADD_DIS_AMT_DTL,15) I_PRICE,
	    W_CODE,
	    IAS_WCODE_PKG.GET_WC_NM(W_CODE,'||p_lang_no||')W_NAME,
	    CC_CODE,
	    IAS_CC_CODE_PKG.GET_CC_NAME(CC_CODE, '||p_lang_no||') CC_NAME,
	    0 ADD_DIS_PER,
	    0 DIS_AMT_DTL,
	    0 DIS_AMT,
	    0 DIS_AMT_MST,
	    VAT_PER,
	    ROUND(VAT_AMT,15) VAT_AMT,
	    ITEM_DESC,
	    RCRD_NO,
	    IAS_ITM_PKG.GET_ITM_NAME(I_CODE,2) I_E_NAME
	FROM IAS_BILL_DTL_ADD_DISC
	WHERE DOC_SER='||p_doc_Ser||'
	ORDER BY RCRD_NO
	';
    end if;

    <<prc_end>>
    if v_msg_txt is not null then
	p_error := v_msg_txt ||chr(10)||'On line: '||v_err_line;
    end if;
end GetDocDtl;

procedure GetTaxInpt(p_lang_no	 in  number,
		    p_doc_Ser	in  number,
		    p_ref_cur	out sys_refcursor,
		    p_error	out varchar2,
		    p_pos	in  number default 0)
as
v_msg_txt   varchar2(4000);
v_pkg_line  varchar2(4000);
v_err_line  varchar2(4000);

begin

    open p_ref_cur for '
	 SELECT GNR_TAX_INPT_MOVMNT.TAX_NO,
	       DECODE('||P_LANG_NO||',1,GNR_TAX_CODE_MST.TAX_L_NM,GNR_TAX_CODE_MST.TAX_F_NM) TAX_NAME,
	       GNR_TAX_TYP_CLC_MST.CLC_TYP_NO,
	       DECODE('||P_LANG_NO||',1,GNR_TAX_TYP_CLC_MST.CLC_TYP_L_NM,GNR_TAX_TYP_CLC_MST.CLC_TYP_F_NM) CLC_TYP_NAME,
	       TAX_TYP_CODE AS "TAX_TYPE",
	       tax_amt as "AMOUNT",
	       TAX_CODE as "SUB_TYPE",
	       TAX_PRCNT as "PERCENT",
	       GNR_TAX_INPT_MOVMNT.RCRD_NO,
	       INPT_TYP,
	       INPT_CODE
	from GNR_TAX_INPT_MOVMNT,
	     GNR_TAX_CODE_MST,
	     GNR_TAX_TYP_CLC_MST
	where GNR_TAX_INPT_MOVMNT.TAX_NO = GNR_TAX_CODE_MST.TAX_NO
	    AND GNR_TAX_INPT_MOVMNT.CLC_TYP_NO = GNR_TAX_TYP_CLC_MST.CLC_TYP_NO
	    AND GNR_TAX_INPT_MOVMNT.DOC_SER='||p_doc_ser||'
	ORDER BY RCRD_NO';

    <<prc_end>>
    if v_msg_txt is not null then
	p_error := v_msg_txt ||chr(10)||'On line: '||v_err_line;
    end if;
end GetTaxInpt;


procedure GetTaxMvmnt(p_lang_no   in  number,
		    p_doc_Ser	in  number,
		    p_ref_cur	out sys_refcursor,
		    p_error	out varchar2,
		    p_pos	in  number default 0)
as
v_msg_txt   varchar2(4000);
v_pkg_line  varchar2(4000);
v_err_line  varchar2(4000);

begin

    open p_ref_cur for '
	SELECT GNR_TAX_ITM_MOVMNT.TAX_NO,
	       DECODE('||P_LANG_NO||',1,GNR_TAX_CODE_MST.TAX_L_NM,GNR_TAX_CODE_MST.TAX_F_NM) TAX_NAME,
	       GNR_TAX_TYP_CLC_MST.CLC_TYP_NO,
	       DECODE('||P_LANG_NO||',1,GNR_TAX_TYP_CLC_MST.CLC_TYP_L_NM,GNR_TAX_TYP_CLC_MST.CLC_TYP_F_NM) CLC_TYP_NAME,
	       TAX_TYP_CODE AS "TAX_TYPE",
	       ROUND(tax_amt*i_qty,15) as "AMOUNT",
	       TAX_CODE as "SUB_TYPE",
	       TAX_PRCNT as "PERCENT",
	       GNR_TAX_ITM_MOVMNT.I_CODE,
	       GNR_TAX_ITM_MOVMNT.RCRD_NO
	from GNR_TAX_ITM_MOVMNT,
	     GNR_TAX_CODE_MST,
	     GNR_TAX_TYP_CLC_MST
	where GNR_TAX_ITM_MOVMNT.TAX_NO = GNR_TAX_CODE_MST.TAX_NO
	    AND GNR_TAX_ITM_MOVMNT.CLC_TYP_NO = GNR_TAX_TYP_CLC_MST.CLC_TYP_NO
	    AND GNR_TAX_ITM_MOVMNT.DOC_SER='||p_doc_ser||'
	ORDER BY RCRD_NO';

    <<prc_end>>
    if v_msg_txt is not null then
	p_error := v_msg_txt ||chr(10)||'On line: '||v_err_line;
    end if;
end GetTaxMvmnt;



PROCEDURE GET_inpt_data (   P_inpt_typ	   In	  Varchar2
			   ,P_Fld_Nm1	   In	  Varchar2 Default Null
			   ,P_Fld_Nm2	   In	  Varchar2 Default Null
			   ,P_Fld_Nm3	   In	  Varchar2 Default Null
			   ,P_Fld_Nm4	   In	  Varchar2 Default Null
			   ,P_Fld_Val1	   In	  Varchar2 Default Null
			   ,P_Fld_Val2	   In	  Varchar2 Default Null
			   ,P_Fld_Val3	   In	  Varchar2 Default Null
			   ,P_Fld_Val4	   In	  Varchar2 Default Null
			   ,P_whr	   In	  Varchar2 Default Null
			   ,P_Usr_no	   In	  Number   Default Null
			   ,P_Brn_no	   In	  Number   Default Null
			   ,p_ref_cur	   out	  SYS_REFCURSOR
			   ,p_error	   out	  Varchar2)Is

/*--##############################################################--
 INPUT TYPE NAME	      CODEING		     PARAMETER
   --------------------------------------------------------------------
    USERS			 USER
    BRN_NO			 BRN		  P_Usr_no
    Account			 ACODE		  P_Usr_no
    EmPLOOYE			 EMP		  P_Usr_no
    Customer			 CSTMR		  P_Usr_no
    Sales_Man			 SMAN		  P_Usr_no
    Collerctor			 COLNO		  P_Usr_no
    Cost_Centers		 CC_CODE	  P_Usr_no
    Projects			 PJNO		  P_Usr_no
    Actvty			 ACTVNO 	  P_Usr_no
    Warehouse			 WCODE		  P_Usr_no
    Cash_In_Hand		 CASH		  P_Usr_no,P_brn_no
    Bank			 BANK		  P_Usr_no
    TAXS			 TAXNO
    Method Of Tax.Calc		 CLC_TYP_NO_TAX    P_Usr_no,P_brn_no
    SALES order Types		 SO_TYPE	   P_Usr_no
    Sales Types 		 SI_TYPE	   P_Usr_no
    RETURN Sales Types		 SR_TYPE	   P_Usr_no
    cities			 CITY
    CNTRY			 CNTRY
    Regions			 RCODE
    CURRENCY			 ACY
    Group Details		 GCODE		  P_Usr_no
    SUB  Group Details		 SUBGCODE	  P_Usr_no
    Customer_Group		 CSTMRGCODE
    ITEMS WITHOUT UNIT		 ITMCODE	  P_Usr_no
    ITEMS WITH UNIT		 ITM_WITH_UNT	  P_Usr_no
    ITEMS UNIT			 ITM_UNT
    Cash Customer		 CSH_CSTMR
--##############################################################-- */
    V_whr		Varchar2(8000) ;
    V_Ordr		Varchar2(20000) ;
    V_Sql_qry		Varchar2(20000) ;
    P_MSG_NO		Varchar2(8000) ;
    V_XML_TYP		XMLTYPE;
    V_Msg_Txt		Varchar2(4000);
    QRY_CTX	       DBMS_XMLGEN.CTXHANDLE;
    QRY_RSLT	       CLOB;
   Begin
    --p_error := '{"_Result": { "_ErrMsg": "@errmsg","_ErrNo": @errno } }';
      ------------------------------------------------------------------
     commit;
     If P_Fld_Nm1 Is Not Null And P_Fld_Val1 Is Not Null  Then
       V_Whr :=V_Whr|| ' And '||P_Fld_Nm1||'='''||P_Fld_Val1||'''';
     End If;
     ------------------------------------------------------------------
     If P_Fld_Nm2 Is Not Null And P_Fld_Val2 Is Not Null  Then
       V_Whr := V_Whr|| ' And '||P_Fld_Nm2||'='''||P_Fld_Val2||'''';
     End If;
     ------------------------------------------------------------------
     If P_Fld_Nm3 Is Not Null And P_Fld_Val3 Is Not Null  Then
       V_Whr := V_Whr|| ' And '||P_Fld_Nm3||'='''||P_Fld_Val3||'''';
     End If;
     ------------------------------------------------------------------
     If P_Fld_Nm4 Is Not Null And P_Fld_Val4 Is Not Null  Then
       V_Whr := V_Whr|| ' And '||P_Fld_Nm4||'='''||P_Fld_Val4||'''';
     End If;
     ------------------------------------------------------------------
     If  P_Inpt_Typ Is Null Then
	     V_msg_txt := 'Enter P_Inpt_Typ   ';
	     Goto Rtn_rslt;
     End If;

     If Upper(P_Inpt_Typ) not in ('USER','ITM_UNT','CSTMRGCODE','ACY','RCODE','CITY','TAXNO') And P_Usr_no Is Null Then
	     V_msg_txt := 'Enter P_Usr_no   ';
	     Goto Rtn_rslt;
     End If;
      If  UPPER(P_Inpt_Typ) = 'USER' Then    --U_id USR_NO, Decode ('||P_Lng_No||', 1, U_A_Name, Nvl (U_E_Name, U_A_Name)) USR_NM
	   V_Sql_Qry:=' Select ROWNUM  ROW_NUM ,USER_R.*
			    From User_R  Where	Nvl (Inactive, 0)=0  ';

      Elsif  UPPER(P_Inpt_Typ) = 'BRN' Then
	    V_Sql_Qry:='Select ROWNUM  ROW_NUM ,S_Brn.*
					From S_Brn
					Where Nvl (Inactive, 0)=0
					  AND	Exists(Select 1 From S_Brn_Usr_Priv
						     Where u_id='||P_Usr_no||'
						      And Brn_no=S_Brn.Brn_no
						      And Nvl(Add_Bnf_Flag,0)=1
						      And RowNum<=1)  ';

      Elsif  UPPER(P_Inpt_Typ) = 'ACODE' Then
	  V_Sql_Qry:=' Select ROWNUM  ROW_NUM ,Account.*
				  From Account
				 Where	A_S_M In (Select Account_Type
						       From Account_Types
						      Where Affected_By_Trans = 1 And Rownum <= 1)
							AND Exists(Select 1 From PRIV_ACC
												 Where u_id='||P_Usr_no||'
												  And A_CODE=Account.A_CODE
												  And Nvl(ADD_FLAG,0)=1
												  And RowNum<=1)  ';
      Elsif  UPPER(P_Inpt_Typ) = 'EMP' Then
		V_Sql_Qry := ' Select ROWNUM  ROW_NUM ,M.*
				   From S_Emp M
				   Where Nvl (Inactive, 0)=0
				   AND	(('||P_Usr_no||' = 1)
								Or 1 =	 (Case When Ys_Gen_Pkg.Get_Fld_Value (''IAS_PARA_GEN'', ''EMP_PRV_TYP'') = 0
												 Then 1
											      Else (Select 1
												      From S_Emp_Prv
												     Where U_Id = '||P_Usr_no||'
												       And Empno_Hrchyno =
													      Decode (Emp_Prv_Typ,
														      1, M.Emp_No,
														      2, M.Hrchy_No
														     )
												       And Nvl(Add_Flag,0) = 1
												       And Rownum <= 1)
											   End) )  ';
      Elsif  UPPER(P_Inpt_Typ) = 'CSTMR' Then
	 V_Sql_Qry := ' Select ROWNUM  ROW_NUM ,Customer.*
			  From Customer
			 Where Nvl (Inactive, 0)=0
			 AND (	 ( '||P_Usr_no||' = 1)
				Or (   (    ( Ys_Gen_Pkg.Get_Fld_Value (''IAS_PARA_AR'', ''AR_AC_LINK_TYPE '') = 1)
					And Exists
					       (Select 1
						  From Priv_Acc
						 Where U_Id = '||P_Usr_no||' And A_Code = Customer.C_A_Code And Nvl (Add_Flag, 0) = 1 And Rownum <= 1))
				    Or (    ( Ys_Gen_Pkg.Get_Fld_Value (''IAS_PARA_AR'', ''AR_AC_LINK_TYPE '') = 2)
					And Exists
					       (Select 1
						  From Ias_Priv_Customer
						 Where U_Id = '||P_Usr_no||' And C_Code = Customer.C_Code And Nvl (Add_Flag, 0) = 1 And Rownum <= 1))))  ';

      Elsif  UPPER(P_Inpt_Typ) = 'SMAN' Then
	  V_Sql_Qry:='Select ROWNUM  ROW_NUM ,Sales_Man.*
				From Sales_Man
			       Where Nvl (Inactive, 0)=0
			       AND  (('||P_Usr_no||' = 1 )
				     Or(Exists (Select 1  From IAS_PRIV_SMAN
					   Where U_Id	= '||P_Usr_no||'
					     And Rep_code = sales_man.reprs_code
					     And Nvl(Add_Flag,0)=1
					     And Rownum<=1)))	 ';
      Elsif  UPPER(P_Inpt_Typ) = 'COLNO' Then
	  V_Sql_Qry:='	Select ROWNUM  ROW_NUM ,Collerctor.*
		    From Collerctor
		   Where Nvl (Inactive, 0)=0
		   AND Exists
			    (Select 1
			       From Ias_Priv_Collectors
			      Where U_Id = '||P_Usr_no||' And Col_No = Collerctor.Col_No And Nvl (Add_Flag, 0) = 1 And Rownum <= 1) ';
      Elsif  UPPER(P_Inpt_Typ) = 'CC_CODE' Then
	V_Sql_Qry:=' Select ROWNUM  ROW_NUM ,Cost_Centers.*
			From Cost_Centers
		       Where	 Nvl (Inactive_Sls, 0) = 0
			     And C_S_M = (Select Cc_Type
					    From Cost_Center_Types
					   Where Affected_By_Trans = 1)
			     And (   ( '||P_Usr_no||' = 1)
				  Or Exists
					(Select Cc_Code
					   From Privilege_Cc
					  Where U_Id = '||P_Usr_no||' And Cc_Code = Cost_Centers.Cc_Code And Nvl (Add_Flag, 0) = 1 And Rownum <= 1))  ';

      Elsif  UPPER(P_Inpt_Typ) = 'PJNO' Then
	  V_Sql_Qry:='	Select ROWNUM  ROW_NUM ,Ias_Projects.*
		From Ias_Projects
	       Where	 Pj_Sub = 1
	       AND Nvl (Inactive, 0) = 0
		     And (   ('||P_Usr_no||'= 1)
			  Or Exists
				(Select Pj_No
				   From Ias_Priv_Projects
				  Where U_Id =	'||P_Usr_no||' And Pj_No = Ias_Projects.Pj_No And Nvl (Add_Flag, 0) = 1 And Rownum <= 1)) ';
      Elsif  UPPER(P_Inpt_Typ) = 'ACTVNO' Then
	  V_Sql_Qry:=' Select ROWNUM  ROW_NUM ,Ias_Actvty.*
			From Ias_Actvty
		       Where	 Actv_Sub = 1
			     And Nvl (Inactive, 0) = 0
			     And (   (	'||P_Usr_no||' = 1)
				  Or Exists
					(Select Actv_No
					   From Ias_Priv_Actvty
					  Where U_Id =	'||P_Usr_no||' And Actv_No = Ias_Actvty.Actv_No And Nvl (Add_Flag, 0) = 1 And Rownum <= 1))  ';
      Elsif  UPPER(P_Inpt_Typ) = 'WCODE' Then
	  V_Sql_Qry:=' Select  Select ROWNUM  ROW_NUM ,Warehouse_Details.*
			  From Warehouse_Details
			 Where Inactive <> 1
			       And (   ( '||P_Usr_no||' = 1)
				    Or Exists
					  (Select W_Code
					     From Privilege_Wh
					    Where U_Id = '||P_Usr_no||' And W_Code = Warehouse_Details.W_Code And Nvl (Add_Flag, 0) = 1 And Rownum <= 1))  ';
      Elsif  UPPER(P_Inpt_Typ) = 'CASH' Then
	 If P_brn_no Is Null Then
		 V_msg_txt := 'Enter P_brn_no	';
		 Goto Rtn_rslt;
	 End If;
	V_Sql_Qry:='  Select ROWNUM  ROW_NUM ,Cash_In_Hand.*
			  From Cash_In_Hand
			 Where	   Conn_Brn_No = '||P_brn_no||'
			   And Nvl (Inactive, 0) = 0
			   And (   '||P_Usr_no||' = 1
				    Or Exists
					  (Select Cash_No
					     From Priv_Cash
					    Where U_Id = '||P_Usr_no||' And Cash_No = Cash_In_Hand.Cash_No And Cash_Type = 1 And Nvl (Add_Flag, 0) = 1 And Rownum <= 1)) ';
      Elsif  UPPER(P_Inpt_Typ) = 'BANK' Then
	 V_Sql_Qry:='  Select ROWNUM  ROW_NUM ,Cash_At_Bank.*
		      From Cash_At_Bank
		     Where Nvl (Inactive, 0) = 0
			   And ( '||P_Usr_no||' = 1
				Or Exists
				      (Select Cash_No
					 From Priv_Cash
					Where U_Id = '||P_Usr_no||' And Cash_No = Cash_At_Bank.Bank_No And Cash_Type = 2 And Nvl (Add_Flag, 0) = 1 And Rownum <= 1))  ';
      Elsif  UPPER(P_Inpt_Typ) = 'TAXNO' Then
	V_Sql_Qry:='  Select ROWNUM  ROW_NUM ,Gnr_Tax_Code_Mst.*
			  From Gnr_Tax_Code_Mst
			 Where Nvl (Inactive, 0)=0  ';

      Elsif  UPPER(P_Inpt_Typ) = 'CLC_TYP_NO_TAX' Then
	 If P_brn_no Is Null Then
		 V_msg_txt := 'Enter P_brn_no	';
		 Goto Rtn_rslt;
	 End If;
	 V_Sql_Qry:=' Select Rownum ROW_NUM, Clc_Typ_No_Tax ,Clc_Typ_L_Nm ,Clc_Typ_F_Nm
		      From (Select Distinct M.Clc_Typ_No Clc_Typ_No_Tax,Clc_Typ_L_Nm ,Clc_Typ_F_Nm
			      From Gnr_Tax_Typ_Clc_Mst M, Gnr_Tax_Typ_Clc_Brn Db
			     Where     M.Clc_Typ_No = Db.Clc_Typ_No
				   And Db.Brn_No = Decode (Nvl ( '||P_Brn_No||', 0),  0, 0,  Db.Brn_No, Nvl (  '||P_Brn_No||', 0))
				   And (   M.Clc_Tax_Typ <> 0
					Or Exists
					      (Select D.Clc_Typ_No
						 From Gnr_Tax_Typ_Clc_Dtl D, Gnr_Tax_Code_Mst T
						Where D.Tax_No = T.Tax_No And D.Clc_Typ_No = M.Clc_Typ_No And T.Clc_Doc_Typ In (1, 3) And Rownum <= 1)))
		     Where 1 = 1   ';
      Elsif  UPPER(P_Inpt_Typ) = 'SO_TYPE' Then
	 V_Sql_Qry:='Select ROWNUM  ROW_NUM ,Ias_Sorder_Types.*
			  From Ias_Sorder_Types
			 Where (   ( '||P_Usr_no||' = 1)
				Or Exists
				      (Select S_Type
					 From Ias_Priv_Ar
					Where U_Id = '||P_Usr_no||' And Nvl (Add_Flag, 0) = 1
					And Ias_Priv_Ar.S_Type = Ias_Sorder_Types.So_Type
					 And Ias_Priv_Ar.Ar_Type = 2
					 And Rownum <= 1))   ';
      Elsif  UPPER(P_Inpt_Typ) = 'SI_TYPE' Then
	V_Sql_Qry:='Select ROWNUM  ROW_NUM ,Ias_Sales_Types.*
				From Ias_Sales_Types
				Where  Exists(Select S_Type From Ias_Priv_Ar
						Where U_Id='||P_Usr_no||'
						  And Ias_Priv_Ar.Ar_Type=3
						  And Ias_Priv_Ar.S_Type=Ias_Sales_Types.SI_Type
					  And Nvl(Add_Flag,0)=1
						  And Rownum<=1)   ';
      Elsif  UPPER(P_Inpt_Typ) = 'SR_TYPE' Then
	V_Sql_Qry:=' Select ROWNUM  ROW_NUM ,Ias_Rt_Sales_Types.*
				From Ias_Rt_Sales_Types
				Where  Exists(Select S_Type From Ias_Priv_Ar
						Where U_Id='||P_Usr_no||'
						  And Ias_Priv_Ar.Ar_Type=4
						  And Ias_Priv_Ar.S_Type=Ias_Rt_Sales_Types.SR_Type
					  And Nvl(Add_Flag,0)=1
						  And Rownum<=1)  ';
      Elsif Upper(P_Inpt_Typ) = 'CITY' Then
	  V_Sql_Qry:='Select ROWNUM  ROW_NUM ,cities.*
			   From cities ';
      Elsif Upper(P_Inpt_Typ) = 'CNTRY' Then
	  V_Sql_Qry:='Select ROWNUM  ROW_NUM ,CNTRY.*
			   From CNTRY ';
      Elsif Upper(P_Inpt_Typ) = 'PROV' Then
	  V_Sql_Qry:='Select ROWNUM  ROW_NUM ,IAS_PROVINCES.*
			   From IAS_PROVINCES ';
      Elsif Upper(P_Inpt_Typ) = 'RCODE' Then
	 V_Sql_Qry:=' Select ROWNUM  ROW_NUM ,Regions.*
			   From Regions ';
      Elsif Upper(P_Inpt_Typ) = 'ACY' Then
	    V_Sql_Qry:=' Select ROWNUM	ROW_NUM ,Ex_Rate.*
			   From Ex_Rate ';
      Elsif Upper(P_Inpt_Typ) = 'GCODE' Then
	   V_Sql_Qry:=' Select ROWNUM  ROW_NUM ,Group_Details.*
			    From Group_Details
			   Where   '||P_Usr_no||' = 1
				 Or Exists
				       (Select G_Code
					  From Privilege_Gc
					 Where U_Id = '||P_Usr_no||' And G_Code = Group_Details.G_Code And Add_Flag = 1 And Rownum <= 1)  ';
      Elsif Upper(P_Inpt_Typ) = 'SUBGCODE' Then
	   V_Sql_Qry:=' Select ROWNUM  ROW_NUM ,Ias_Sub_Grp_Dtl.*
			  From Ias_Sub_Grp_Dtl
			 Where	  (   '||P_Usr_no||' = 1
				    Or Exists
					  (Select G_Code
					     From Privilege_Gc
					    Where Nvl (Add_Flag, 0) = 1 And U_Id = '||P_Usr_no||' And G_Code = Ias_Sub_Grp_Dtl.G_Code And Rownum <= 1))  ';
      Elsif Upper(P_Inpt_Typ) = 'CSTMRGCODE' Then
	  V_Sql_Qry:='Select ROWNUM  ROW_NUM ,Customer_Group.*
	      From Customer_Group ';
      Elsif Upper(P_Inpt_Typ) = 'ITMCODE' Then
	 V_Sql_Qry:='Select ROWNUM  ROW_NUM ,Ias_Itm_Mst.*
			From Ias_Itm_Mst
		       Where  Get_Items_Activity (Activity_No
						    , '||P_Usr_no||'
						    , Ys_Gen_Pkg.Get_Fld_Value (''IAS_PARA_Inv'', ''Conn_Itm_Act_By_Usr_Priv'')
						    ,1) = 1
			     And (  '||P_Usr_no||' = 1
				  Or Exists
					(Select 1
					   From Privilege_Gc
					  Where U_Id = '||P_Usr_no||' And G_Code = G_Code And Nvl (Add_Flag, 0) = 1 And Rownum <= 1))  ';
      Elsif Upper(P_Inpt_Typ) = 'ITM_WITH_UNT' Then
	 V_Sql_Qry:=' Select ROWNUM  ROW_NUM ,m.*
			    ,D.Itm_Unt,D.P_SIZE,D.MAIN_UNIT,D.SALE_UNIT ,D.PUR_UNIT,d.NO_SALE
			From Ias_Itm_Mst M, Ias_Itm_Dtl D
		       Where	 M.I_Code = D.I_Code
			     And Get_Items_Activity (M.Activity_No
						    , '||P_Usr_no||'
						    , Ys_Gen_Pkg.Get_Fld_Value (''IAS_PARA_Inv'', ''Conn_Itm_Act_By_Usr_Priv'')
						    ,1) = 1
			     And (   '||P_Usr_no||' = 1
				  Or Exists
					(Select 1
					   From Privilege_Gc
					  Where U_Id ='||P_Usr_no||' And G_Code = M.G_Code And Nvl (Add_Flag, 0) = 1 And Rownum <= 1))';
	 V_Ordr:=' ORDER BY I_Code '  ;
      Elsif Upper(P_Inpt_Typ) = 'ITM_UNT' Then
	  V_Sql_Qry:='Select DISTINCT  ROWNUM  ROW_NUM ,Ias_Itm_Dtl.*
			   From Ias_Itm_Dtl			      ';
      Elsif Upper(P_Inpt_Typ) = 'CSH_CSTMR' Then
	  V_Sql_Qry:='Select ROWNUM  ROW_NUM , E_MAIL C_E_MAIL, MOBILE_NO C_MOBILE,
		      CUST_L_NM C_A_NAME, CUST_F_NM C_E_NAME, TEL_NO C_PHONE, FAX_NO C_FAX,
		      PBOX C_BOX, ADDRESS C_ADDRESS, CUST_CODE C_CODE,
		      IAS_CASH_CUSTMR.*
	      From IAS_CASH_CUSTMR ';
      End If;
      V_SQL_QRY:=' select * from ( '||V_SQL_QRY||' ) where 1=1 ';
      V_SQL_QRY:=V_SQL_QRY||V_WHR||P_WHR||V_Ordr;
      /*QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL_QRY);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);*/

      open p_ref_cur for v_sql_qry;


  --####################--
   <<Rtn_rslt>>
   If V_msg_txt Is Not Null Then
	 p_error := Replace(p_error, '@errmsg', V_msg_txt);
   End If;
--####################--
   Exception
      When Others Then
	 Raise_Application_Error (-20083, 'GET_inpt_data , ' || Sqlerrm);
end GET_inpt_data;





FUNCTION Get_Hashed_Doc_Ser(p_doc_ser	In	number,
			    p_ad_date	In	date)
			    return varchar2
is
v_hash varchar2(30);
begin

    select ORA_HASH(p_doc_ser||TO_CHAR(p_ad_date,'DD/MM/YYYY HH24:MI:SS'))
    into v_hash
    from dual;
    return v_hash;
    exception when others then
    return null;
end Get_Hashed_Doc_Ser;


FUNCTION Get_DOC_GUID(p_doc_ser     In	    number,
		      p_ad_date     In	    date,
		      p_doc_typ     In	    number,
		      p_brn_usr     In	    number,
		      p_sys_no	    In	    number  default null,
		      p_year	    In	    number  default null)
		      return varchar2
is
v_guid	    varchar2(1000);
v_doc_ser   varchar2(100);
v_jv_typ    number;
begin
    v_doc_ser := Get_Hashed_Doc_Ser(p_doc_ser	=> p_doc_ser,
				    p_ad_date	=> p_ad_date);

    if p_doc_typ = 2 then
	v_jv_typ := 3;
    elsif p_doc_typ = 4 then
	if p_sys_no = 61 then
	    v_jv_typ := 0;
	elsif p_sys_no = 80 then
	    v_jv_typ := 1;
	elsif p_sys_no = 87 then
	    v_jv_typ := 6;
	end if;
    elsif p_doc_typ = 5 then
	if p_sys_no = 61 then
	    v_jv_typ := 2;
	elsif p_sys_no = 80 then
	    v_jv_typ := 5;
	elsif p_sys_no = 87 then
	    v_jv_typ := 7;
	end if;
    elsif p_doc_typ = 15 then
	v_jv_typ := 4;
    end if;

    v_guid := utl_raw.cast_to_varchar2(
			utl_encode.base64_encode(
			    utl_raw.cast_to_raw((p_brn_usr||';'||
						 v_doc_ser||';'||
						 v_jv_typ ||';'||
						 p_year   ||';0'))));

    return v_guid;
end Get_DOC_GUID;

function Create_TLV_Tag(p_tag_no  in number,
			p_data	  in varchar2)
		    return RAW
is
 tlv_tag raw(32000);
 len varchar2(10);
 v_data varchar2(1000);
begin
    v_data := Convert (p_data, 'AL32UTF8');
    len := upper(to_char(length(v_data),'xxx'));
    tlv_tag := trim(to_char(p_tag_no,'xxx'));
    tlv_tag := UTL_RAW.CONCAT(tlv_tag,trim(len));
    tlv_tag := UTL_RAW.CONCAT(tlv_tag, utl_raw.cast_to_raw(v_data));
    return tlv_tag;
end;

function Get_Doc_Qr_Data(  p_saller_name	    in	  varchar2,
			   p_tax_code		    in	  varchar2,
			   p_ad_date		    in	  date,
			   p_bill_tot_incld_vat     in	  varchar2,
			   p_vat_tot		    in	  varchar2,
			   p_base64_encoded	    in	  number default 0)
			   return varchar2
is
v_tag raw(32000);
v_qr_data varchar2(4000);
begin
    if p_base64_encoded = 1 then
	v_tag := Create_TLV_Tag(1, p_saller_name);
	v_tag := UTL_RAW.concat(v_tag,(Create_TLV_Tag(2,p_tax_code)));
	v_tag := UTL_RAW.concat(v_tag,(Create_TLV_Tag(3,to_char(p_ad_date,'yyyy-mm-dd')||'T'||to_char(p_ad_date,'hh24:mi:ss')||'Z')));
	v_tag := UTL_RAW.concat(v_tag,(Create_TLV_Tag(4,p_bill_tot_incld_vat)));
	v_tag := UTL_RAW.concat(v_tag,(Create_TLV_Tag(5,p_vat_tot)));
	v_qr_data := utl_raw.cast_to_varchar2(
			    utl_encode.base64_encode(v_tag));

	Return replace(Replace(v_qr_data,chr(10),null),chr(13),null);
    else
	v_qr_data := '??????: '||p_saller_name||chr(10)||
		     '????? ???????: '||p_tax_code||chr(10)||
		     '??????? ??????: '||p_ad_date||chr(10)||
		     '???????? ???? ???????: '||p_bill_tot_incld_vat||chr(10)||
		     '???????: '||p_vat_tot;
	return v_qr_data;
    end if;
end;

function Get_Doc_qr_code( p_sys_no    in  number,
			  p_brn_no    in  number,
			  p_doc_type  in  number,
			  p_doc_ser   in  number,
			  p_uuid      in  varchar2)
			  return varchar2
is
V_USE_SALE_OUTLET number;
V_POS_REF_CODE	  number;
V_ETS_SRVC_FLG	  NUMBER;
V_SRVC_NO	  NUMBER;
V_OUTLET_NO	  NUMBER;
V_QR		  VARCHAR2(1024);
begin
  IF NVL(IAS_BRN_PKG.IS_BRN_USE_E_INVC(P_BRN_NO => p_brn_no), 0) <> 0 THEN

    EXECUTE IMMEDIATE 'SELECT NVL(USE_SALE_OUTLET,0) FROM IAS_PARA_GEN WHERE ROWNUM<=1' INTO  V_USE_SALE_OUTLET;
    IF NVL(V_USE_SALE_OUTLET,0)=1 AND P_SYS_NO=170 THEN
       EXECUTE IMMEDIATE 'SELECT OUTLET_NO FROM REM_V_E_INVC_JSON WHERE DOC_SRL=:P_DOC_SER AND DOC_TYPE=:P_DOC_TYPE'
       INTO  V_OUTLET_NO USING P_DOC_SER, P_DOC_TYPE ;
       IF NVL(V_OUTLET_NO,0) <> 0 THEN
	  SELECT	  NVL(SRVC_NO, '0')
	  INTO		  V_POS_REF_CODE
	  FROM		  GNR_SALE_OUTLET
	  WHERE 	  OUTLET_NO = V_OUTLET_NO;
       END IF;
       --
    ELSE
      SELECT	      NVL(POS_REF_CODE, '0')
      INTO	      V_POS_REF_CODE
      FROM	      S_BRN
      WHERE	      BRN_NO = P_BRN_NO;
    END IF;

    BEGIN
      SELECT	      ETS_SRVC_FLG, SRVC_NO
      INTO	      V_ETS_SRVC_FLG, V_SRVC_NO
      FROM	      GNR_WEB_SRVC_MST
      WHERE	      NVL(ETS_SRVC_FLG, 0) = 1 AND SRVC_NO = V_POS_REF_CODE AND ROWNUM <= 1;
    EXCEPTION
	WHEN OTHERS THEN
	    V_ETS_SRVC_FLG		 := 0;
    END;

    IF NVL(V_SRVC_NO,0)>0 AND NVL(V_ETS_SRVC_FLG,0)=1 THEN
      GNR_TECH_SOLUTION_PKG.INITIALIZE(V_SRVC_NO);
      V_QR := GNR_TECH_SOLUTION_PKG.GETQRCODE(P_UUID => P_uuid);
      return V_QR;
    END IF;
  END IF;
  RETURN NULL;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
end;

/*function Get_Doc_Qr_Data(  p_guid	   in	  varchar2)
			   return varchar2
is
v_base_url  varchar2(1000);
v_rqust_url varchar2(1000);
v_res_txt   varchar2(4000);
v_res_code  number;
begin

    begin
	select WEB_DOC_LNK
	into v_base_url
	from ias_para_gen
	where rownum<=1;
    exception when others then
	raise_application_error(-20001, 'Error: Web Doc Link is not set then General Parameters.');
    end;

    if v_base_url is null or v_base_url ='' then
	raise_application_error(-20001, 'Error: Web Doc Link is not set then General Parameters.');
    end if;
    v_rqust_url := v_base_url||'/api/qr/'||p_guid;

    IAS_WEB_SRVC_PKG.CALL_WEB_SERVICE_CHAR( P_URL		=> v_rqust_url,
					    P_METHOD		=> 'GET',
					    P_CONTENT_TYPE	=> 'application/json',
					    P_CONTENT		=> '',
					    P_RESPONSE_TEXT	=> v_res_txt,
					    P_HTTP_RSPONS_CODE	=> v_res_code,
					    P_WALLET_PATH	=> null,
					    P_WALLET_PWD	=> null,
					    P_USERNAME		=> null,
					    P_PASSWORD		=> null,
					    P_TOKEN		=> null);
    if v_res_code = 200 then
	return v_res_code;
    else
	return null;
    end if;
end;
*/
function Validate_Onyx_User(p_user_id		    in	  number,
			    p_user_password	    in	  varchar2)
			    return number
is
v_result number := 0;
v_count  number;
begin
    if p_user_id is null or
       p_user_password is null then
       return v_result;
    end if;

    select count(*)
    into v_count
    from user_r
    where u_id = p_user_id
    and password = Ias_Get_Enc_Pass_fnc(P_Pass=>p_user_password);

    if v_count>0 then
	v_result := 1;
    end if;

    return v_result;
end;

function Get_Purchase_Desc( p_doc_type	 in	 number,
			    p_doc_ser	in	number,
			    p_desc	 in	 varchar2,
			    p_return_desc_no	in  number default 0)
			    return varchar2
is
v_cnt		number;
v_p_order_desc	varchar2(250);
v_p_order_no	number;
v_s_order_desc	varchar2(250);
v_doc_Ser	number;
v_return_val	varchar2(250);
begin
  /* if p_doc_type = 4 then
	select count(distinct doc_ser_ref) into v_cnt
	from ias_bill_dtl
	where bill_ser=p_doc_ser;

	if v_cnt <> 1 then
	    if p_return_desc_no = 1 then
		return v_p_order_no;
	    else
		return p_desc;
	    end if;
	end if;

	v_cnt := 0;

	select count(distinct doc_ser_ref) into v_cnt
	from order_detail
	where order_ser in (select distinct doc_Ser_ref
			    from ias_bill_dtl
			    where bill_ser=p_doc_ser);

	if v_cnt <> 1 then
	    if p_return_desc_no = 1  then
		return v_p_order_no;
	    else
		return p_desc;
	    end if;
	end if;

	select po_desc, po_no
	into v_p_order_desc , v_p_order_no
	from p_order
	where po_ser in (select distinct doc_ser_ref
			 from order_detail
			 where order_ser in (select distinct doc_ser_ref
					     from ias_bill_dtl
					     where bill_Ser=p_doc_ser));

	if v_p_order_desc is not null then
	    if p_return_desc_no = 1  then
		return v_p_order_no;
	    else
		return v_p_order_desc;
	    end if;
	end if;

	select a_desc, order_no
	into v_s_order_desc, v_p_order_no
	from sales_order
	where order_ser in (select distinct doc_ser_ref
			    from ias_bill_dtl
			    where bill_ser=p_doc_ser);

	if v_s_order_desc is not null then
	    if p_return_desc_no = 1  then
		return v_p_order_no;
	    else
		return v_s_order_desc;
	    end if;
	end if;

	if p_return_desc_no = 1  then
	    return v_p_order_no;
	else
	    return p_desc;
	end if;
    elsif p_doc_type = 5 then
	select count(distinct doc_ser_ref)
	into v_cnt
	from ias_rt_bill_dtl
	where rt_bill_ser=p_doc_ser;

	if v_cnt <> 1 then
	    if p_return_desc_no = 1  then
		return v_p_order_no;
	    else
		return p_desc;
	    end if;
	end if;

	select bill_ser
	into v_doc_ser
	from ias_rt_bill_dtl
	where rt_bill_ser=p_doc_ser
	and rownum<=1;

	return	Get_Purchase_Desc( p_doc_type  => 4,
				  p_doc_ser  => v_doc_ser,
				  p_desc      => p_desc,
				  p_return_desc_no => p_return_desc_no);

    end if;
    if p_return_desc_no = 1  then
	return v_p_order_no;
    else
	return p_desc;
    end if;
    */
    Return(null);
end Get_Purchase_Desc;
End Ias_Web_Doc_Pkg ;
/

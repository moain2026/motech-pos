-- =============================================
-- PACKAGE SPEC: IAS_SMS_MAIL_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE IAS_SMS_MAIL_PKG AS

G_Lng_No		      PLS_INTEGER;
G_Usr_No		      PLS_INTEGER;
G_CMP_NO		      PLS_INTEGER;
G_BRN_NO		      PLS_INTEGER;
G_BRN_USR		      PLS_INTEGER;
G_BRN_YEAR		      PLS_INTEGER;
G_GET_ACCNT_ALRT	      PLS_INTEGER;
G_GET_ACCNT_DTL_ALRT	      PLS_INTEGER;
G_GET_DUE_CHQ_ALRT	      PLS_INTEGER;
G_PRD_ALRT_PYMNT_DUE_CHQ      PLS_INTEGER;
G_PRD_ALRT_RCPT_DUE_CHQ       PLS_INTEGER;
G_HOUR_SEND_ACCNT_BLNC	      PLS_INTEGER;
G_HOUR_SEND_CST_BLNC	      PLS_INTEGER;
G_HOUR_SEND_CHQ_ALRT	      PLS_INTEGER;
G_GET_ACCNT_DTL_SUB_ALRT      PLS_INTEGER;
G_TMPLT_NM		      IAS_SYS.S_MSG_MOBILE_AUTO.TMPLT_NM%TYPE;
G_WHATSAPP_SND_TYP	      S_DOC_MSG_ALRT.WHATSAPP_SND_TYP%TYPE;

 PROCEDURE GET_PRMTR ( P_Lng_no      In Pls_Integer    DEFAULT NULL,
		       P_Usr_No      In Pls_Integer    DEFAULT NULL,
		       P_CMP_NO      IN  NUMBER DEFAULT NULL,
		       P_BRN_NO      IN  NUMBER DEFAULT NULL);
 FUNCTION GET_MSG_TXT_FNC ( P_Slct_Sql In Varchar2, P_Lng_No In Number Default Null, P_Whr In Varchar2 Default Null) RETURN VARCHAR2;

 PROCEDURE INSRT_MSG_ALRT_PRC (   P_LNG_NO	    IN	NUMBER	       DEFAULT 1,
				  P_MSG_MTHD_SEND   IN	NUMBER	  DEFAULT 1,
				  P_MSG_TYP	    IN	NUMBER,
				  P_MSG_TXT	    IN	VARCHAR2,
				  P_MOBILE_NO	    IN	VARCHAR2  DEFAULT NULL,
				  P_E_MAIL		 IN  VARCHAR2  DEFAULT NULL,
				  P_SUBJCT_MAIL 	 IN  VARCHAR2  DEFAULT NULL,
				  P_ATTCH_EMAIL_FILE	 IN  VARCHAR2  DEFAULT NULL,
				  P_DOC_TYP	    IN	NUMBER	  DEFAULT NULL,
				  P_DOC_SRL	    IN	NUMBER	  DEFAULT NULL,
				  P_AD_DATE	    IN	DATE	  DEFAULT SYSDATE,
				  P_CMP_NO	    IN	NUMBER	  DEFAULT NULL,
				  P_BRN_NO	    IN	NUMBER	  DEFAULT NULL,
				  P_BRN_USR	    IN	NUMBER	  DEFAULT NULL,
				  P_BRN_YEAR	    IN	NUMBER	  DEFAULT NULL);
--##--------------------------------------------------------------------------------------------------##--
PROCEDURE SND_ALRT_IN_SAVE_DOC_PRC (  P_DOC_TYP     IN NUMBER ,
				       P_DOC_SRL     IN NUMBER ,
				       P_FRM_ST      IN VARCHAR2 ,
				       P_LNG_NO      IN NUMBER	   DEFAULT 1);
--##--------------------------------------------------------------------------------------------------##--
PROCEDURE SND_ALRT_IN_SAVE_DOC_PRC (  P_DOC_TYP     IN NUMBER ,
				       P_DOC_SRL     IN NUMBER ,
				       P_FRM_ST      IN VARCHAR2 ,
				       P_SCHMA_NM    IN VARCHAR2 DEFAULT NULL,
				       P_SCHMA_PS    IN VARCHAR2 DEFAULT NULL,
				       P_U_ID	     IN NUMBER,
				       P_FORM_NO     IN NUMBER,
				       P_LNG_NO      IN NUMBER	   DEFAULT 1);

--##--------------------------------------------------------------------------------------------------##--
FUNCTION GET_MOBILE_FNC ( P_DOC_SRL    IN NUMBER,
			  P_SRL_FLD_NM IN VARCHAR2,
			  P_TBL_NM     IN VARCHAR2,
			  P_DOC_TYP    IN VARCHAR2 DEFAULT NULL,
			  P_FORM_NO    IN VARCHAR2 DEFAULT NULL) RETURN VARCHAR2;
--##--------------------------------------------------------------------------------------------------##--
FUNCTION GET_EMAIL_FNC ( P_DOC_SRL IN NUMBER,
			  P_SRL_FLD_NM IN VARCHAR2,
			  P_TBL_NM IN VARCHAR2,
			  P_DOC_TYP IN VARCHAR2 DEFAULT NULL,
			  P_FORM_NO IN VARCHAR2 DEFAULT NULL) RETURN VARCHAR2;
--##--------------------------------------------------------------------------------------------------##--
PROCEDURE PRINT_PRC(  P_DOC_SRL 	 IN   NUMBER,
		      P_DESTYPE 	 IN   VARCHAR2	   DEFAULT NULL,
		      P_DOC_TYP 	 IN   NUMBER	 DEFAULT 1,
		      P_PRNT_NM 	 IN   VARCHAR2	 DEFAULT NULL,
		      P_PRNT_COPIES	 IN   NUMBER	 DEFAULT 1,
		      P_REP_FILE_NM	 IN   VARCHAR2,
		      P_SMPL_RPRT_DFLT	 IN   NUMBER	 DEFAULT 1,
		      P_RPRT_HDR	 IN   VARCHAR2	 DEFAULT NULL,
		      P_ORDR_NOTE	 IN   VARCHAR2	 DEFAULT NULL,
		      P_WHR		 IN   VARCHAR2	 DEFAULT NULL,
		      P_DESFORMAT	 IN   VARCHAR2	 DEFAULT NULL,
		      P_BRN_NO		 IN   NUMBER,
		      P_LNG_NO		 IN   NUMBER	 DEFAULT 1,
		      P_U_ID		 IN   NUMBER,
		      P_FORM_NO 	 IN   NUMBER,
		      P_SCHMA_NM	 IN   VARCHAR2,
		      P_SCHMA_PS	 IN   VARCHAR2,
		      P_PDF_FILE_NM	 IN OUT  VARCHAR2,
		      P_CMND		 OUT	VARCHAR2  );
--##--------------------------------------------------------------------------------------------------##--
FUNCTION GET_S_P_FNC ( P_No In Number ) RETURN VARCHAR2;
--##--------------------------------------------------------------------------------------------------##--
PROCEDURE GET_DOC_MSG_TXT_PRC ( P_DOC_TYP      IN  NUMBER ,
				P_DOC_SRL      IN  NUMBER ,
				P_U_ID	       IN  NUMBER,
				P_FORM_NO      IN  NUMBER,
				P_LNG_NO       IN  NUMBER     DEFAULT 1,
				P_MSG_TXT      OUT VARCHAR2,
				P_MOBILE_NO    OUT VARCHAR2,
				P_E_MAIL       OUT VARCHAR2,
				P_SUBJCT_MAIL  OUT VARCHAR2,
				P_TMPLT_NM     OUT VARCHAR2 );
--##--------------------------------------------------------------------------------------------------##--
End IAS_SMS_MAIL_PKG;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_SMS_MAIL_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY IAS_SMS_MAIL_PKG AS
--##--------------------------------------------------------------------------------------------------##--
PROCEDURE GET_PRMTR ( P_Lng_no	    In Pls_Integer     DEFAULT NULL   ,
		      P_Usr_No	    In Pls_Integer     DEFAULT NULL ,
		      P_CMP_NO	    IN	NUMBER	       DEFAULT NULL,
		      P_BRN_NO	    IN	NUMBER	       DEFAULT NULL
		      ) Is

V_SCHEMA VARCHAR2(50);
Begin

    SELECT SYS_CONTEXT('USERENV','CURRENT_SCHEMA')
      INTO V_SCHEMA
      FROM DUAL;

  G_BRN_YEAR := SUBSTR(V_SCHEMA,4,4);
  G_BRN_USR  := SUBSTR(V_SCHEMA,8);

  G_Usr_No   := P_Usr_No;
  G_CMP_NO   := P_Cmp_No;
  G_BRN_NO   := P_BRN_NO;


   Exception
     When Others Then
	Raise_application_error(-20603,Ias_Gen_Pkg.Get_Msg(G_Lng_No,670)||SqlErrm) ;
End GET_PRMTR;
--##--------------------------------------------------------------------------------------------------##--
FUNCTION GET_MSG_TXT_FNC ( P_Slct_Sql In Varchar2, P_Lng_No In Number Default Null, P_Whr In Varchar2 Default Null) RETURN VARCHAR2 IS

 V_TXT	     Varchar2(4000);
 V_Slct_Sql  Varchar2(4000);
Begin

 IF P_Lng_No IS NOT NULL THEN
    V_Slct_Sql := Replace(Upper(P_Slct_Sql),':P_LNG_NO',P_Lng_No);
 ELSE
    V_Slct_Sql := P_Slct_Sql;
 END IF;
 IF P_Whr IS NOT NULL THEN
    V_Slct_Sql := Replace(Upper(V_Slct_Sql),':P_WHR',P_Whr);
 END IF;

 Execute Immediate ( V_Slct_Sql) Into  V_TXT  ;

 Return(V_TXT);

Exception
  when others then
    Return(NULL);
END GET_MSG_TXT_FNC;
--##--------------------------------------------------------------------------------------------------##--
PROCEDURE INSRT_MSG_ALRT_PRC (
	      P_LNG_NO		 IN  NUMBER   DEFAULT 1,
	      P_MSG_MTHD_SEND	 IN  NUMBER   DEFAULT 1,
	      P_MSG_TYP 	 IN  NUMBER,
	      P_MSG_TXT 	 IN  VARCHAR2,
	      P_MOBILE_NO	 IN  VARCHAR2  DEFAULT NULL,
	      P_E_MAIL			IN  VARCHAR2  DEFAULT NULL,
	      P_SUBJCT_MAIL		IN  VARCHAR2  DEFAULT NULL,
	      P_ATTCH_EMAIL_FILE     IN  VARCHAR2  DEFAULT NULL,
	      P_DOC_TYP 	     IN  NUMBER    DEFAULT NULL,
	      P_DOC_SRL 	     IN  NUMBER    DEFAULT NULL,
	      P_AD_DATE 	     IN  DATE	   DEFAULT SYSDATE,
	      P_CMP_NO		     IN  NUMBER    DEFAULT NULL,
	      P_BRN_NO		     IN  NUMBER    DEFAULT NULL,
	      P_BRN_USR 	     IN  NUMBER    DEFAULT NULL,
	      P_BRN_YEAR	     IN  NUMBER    DEFAULT NULL) IS

V_SR_NO   NUMBER;
V_SR_SRL  NUMBER:=0;
V_Cnt	  NUMBER:=0;

BEGIN

-- Chk Msg Is Exists in Table
Begin
  Select 1
    Into V_Cnt
    From Ias_Sys.S_Msg_Mobile_Auto
    Where NVL2(P_Msg_Txt,Msg_Txt,0)	      = NVL(P_Msg_Txt,0)
     And NVL2(P_Mobile_No,Mobile_No,0)	     = NVL(P_Mobile_No,0)
     And NVL2(P_E_Mail,To_Email,0)	     = NVL(P_E_Mail,0)
     And NVL2(P_Subjct_Mail,Email_Subject,0) = NVL(P_Subjct_Mail,0)
     And Msg_Mthd_Send = P_Msg_Mthd_Send
     And Doc_Typ       = P_Doc_Typ
     And Doc_Srl       = P_DOC_SRL
     And Ad_Date       = P_Ad_Date
     And Brn_Usr       = P_Brn_Usr
     And Brn_Year      = P_Brn_Year
     And Rownum        <= 1;
Exception When Others Then
     V_Cnt :=0;
End;

If  Nvl(V_Cnt,0) > 0 Then -- Duplucate Rows
    Return;
End If;

IF P_BRN_YEAR IS NULL OR P_BRN_USR IS NULL THEN
   GET_PRMTR;
END IF;

BEGIN

  SELECT NVL(MAX(SR_NO),0) +  1 INTO V_SR_NO
      FROM (SELECT SR_NO
	      FROM IAS_SYS.S_MSG_MOBILE_AUTO
	     WHERE BRN_USR   = NVL(P_BRN_USR,G_BRN_USR)
	       AND BRN_YEAR  = NVL(P_BRN_YEAR,G_BRN_YEAR)
	     UNION
	    SELECT SR_NO
	      FROM IAS_SYS.S_MSG_MOBILE_AUTO_HSTRY
	     WHERE BRN_USR   = NVL(P_BRN_USR,G_BRN_USR)
	       AND BRN_YEAR  = NVL(P_BRN_YEAR,G_BRN_YEAR)
	       );

 EXCEPTION WHEN OTHERS THEN
    V_SR_NO :=1;
END;
IF  V_SR_NO IS NOT NULL THEN
    V_SR_SRL:= NVL(P_BRN_YEAR,G_BRN_YEAR)||LPAD(NVL(P_BRN_USR,G_BRN_USR),3,0)||V_SR_NO;
END IF;

IF NVL(V_SR_SRL,0) > 0 AND  P_MSG_TYP IS NOT NULL AND P_MSG_TXT IS NOT NULL AND ( P_MOBILE_NO IS NOT NULL OR P_E_MAIL IS NOT NULL ) THEN

INSERT INTO IAS_SYS.S_MSG_MOBILE_AUTO
       ( LNG_NO,
	 MSG_MTHD_SEND,
	 SR_NO,
	 SR_SRL,
	 MSG_TYP,
	 MSG_TXT,
	 MOBILE_NO,
	 TO_EMAIL,
	 EMAIL_SUBJECT,
	 ATTCH_EMAIL_FILE,
	 DOC_TYP,
	 DOC_SRL,
	 AD_DATE,
	 --PROCSSD_EMAIL_FLG,
	 --PROCSSD_SMS_FLG,
	 MSG_DATE,
	 CMP_NO,
	 BRN_NO,
	 BRN_USR,
	 BRN_YEAR,
	 TMPLT_NM)
  VALUES( NVL(P_LNG_NO,1),
	  P_MSG_MTHD_SEND,
	  V_SR_NO,
	  V_SR_SRL,
	  P_MSG_TYP,
	  P_MSG_TXT,
	  P_MOBILE_NO,
	  P_E_MAIL,
	  P_SUBJCT_MAIL,
	  P_ATTCH_EMAIL_FILE,
	  P_DOC_TYP,
	  P_DOC_SRL,
	  P_AD_DATE,
	  --0,
	  --0,
	  SYSDATE,
	  P_CMP_NO,
	  P_BRN_NO,
	  NVL(P_BRN_USR,G_BRN_USR),
	  NVL(P_BRN_YEAR,G_BRN_YEAR),
	  G_TMPLT_NM );
END IF;
 EXCEPTION
    WHEN OTHERS THEN
      RAISE_APPLICATION_ERROR(-20000,'ERROR WHEN INSERT S_MSG_MOBILE_AUTO = '||SQLERRM);
END INSRT_MSG_ALRT_PRC;
PROCEDURE SND_ALRT_IN_SAVE_DOC_PRC ( P_DOC_TYP	   IN NUMBER ,
				     P_DOC_SRL	   IN NUMBER ,
				     P_FRM_ST	   IN VARCHAR2 ,
				     P_LNG_NO	   IN NUMBER	 DEFAULT 1) Is

    CR_SND		Sys_Refcursor;
    V_SEND_TYP		S_DOC_MSG_ALRT.SEND_TYP%TYPE;
    V_MSG_SQL		S_DOC_MSG_ALRT.MSG_SQL%TYPE;
    V_WHATSAPP_SND_TYP	S_DOC_MSG_ALRT.WHATSAPP_SND_TYP%TYPE;
    V_RPRT_SMPL 	VARCHAR2(16);
    V_T 		VARCHAR2(16);
    V_URL_PRFX		VARCHAR2(500);
    V_GUID		VARCHAR2(100);
    V_MSG_TXT		IAS_SYS.S_MSG_MOBILE_AUTO.MSG_TXT%TYPE;
    V_MOBILE_NO 	IAS_SYS.S_MSG_MOBILE_AUTO.MOBILE_NO%TYPE;
    V_E_MAIL		IAS_SYS.S_MSG_MOBILE_AUTO.TO_EMAIL%TYPE;
    V_SUBJCT_MAIL	IAS_SYS.S_MSG_MOBILE_AUTO.EMAIL_SUBJECT%TYPE;
    V_AD_DATE		IAS_SYS.S_MSG_MOBILE_AUTO.AD_DATE%TYPE;
    V_CMP_NO		IAS_SYS.S_MSG_MOBILE_AUTO.CMP_NO%TYPE;
    V_BRN_NO		IAS_SYS.S_MSG_MOBILE_AUTO.BRN_NO%TYPE;
    V_BRN_USR		IAS_SYS.S_MSG_MOBILE_AUTO.BRN_USR%TYPE;
    V_BRN_YEAR		IAS_SYS.S_MSG_MOBILE_AUTO.BRN_YEAR%TYPE;
    V_SYS_NO		IAS_SYS.GNR_DDC_TBL.SYS_NO%TYPE;

BEGIN

    --ALTER TABLE S_DOC_MSG_ALRT RENAME COLUMN MSG_TXT TO MSG_SQL;
    Begin
	SELECT SEND_TYP, MSG_SQL, WHATSAPP_SND_TYP,TMPLT_NM,
	       case WHATSAPP_RPRT_TYP
		    when 2 then '?v=roll'
		    else '' end
	  INTO V_SEND_TYP, V_MSG_SQL, V_WHATSAPP_SND_TYP,G_TMPLT_NM,V_RPRT_SMPL
	  FROM S_DOC_MSG_ALRT MG WHERE DOC_TYP = P_Doc_Typ AND NVL(INACTV,0)=0 And ROWNUM<=1;
    EXCEPTION WHEN OTHERS THEN
	V_SEND_TYP :=Null;
	V_MSG_SQL  :=Null;
	V_WHATSAPP_SND_TYP:=0;
	V_RPRT_SMPL:='';
    END;
    Begin
	SELECT WEB_DOC_LNK
	  INTO V_URL_PRFX
	  FROM IAS_PARA_GEN
	 WHERE ROWNUM<=1;
    EXCEPTION WHEN OTHERS THEN
	V_URL_PRFX:=Null;
    END;
    BEGIN
	SELECT SYS_NO
	  INTO V_SYS_NO
	  FROM IAS_SYS.GNR_DDC_TBL
	 WHERE DOC_TYP = P_DOC_TYP
	   AND ROWNUM<=1;
    EXCEPTION WHEN OTHERS THEN
	V_SYS_NO:=NULL;
    END;

    IF V_MSG_SQL Is Not Null Then
       V_MSG_SQL := Replace(Upper(V_MSG_SQL),':P_LNG_NO',P_Lng_No);
       V_MSG_SQL := Replace(Upper(V_MSG_SQL),':P_DOC_SRL',P_DOC_SRL);

	OPEN CR_SND FOR V_MSG_SQL;
	LOOP
	    FETCH CR_SND INTO V_MSG_TXT, V_MOBILE_NO, V_E_MAIL, V_SUBJCT_MAIL,
			      V_AD_DATE, V_CMP_NO, V_BRN_NO, V_BRN_USR, V_BRN_YEAR;
	    EXIT WHEN CR_SND%NOTFOUND;

	    --## ADD Or Update OR Delete
	    --P_FRM_ST => ( 'I'=Insert , 'U'=Update  ,'D'=Delete , 'Q'=Query )
	    IF P_FRM_ST = 'D' Then
		V_MSG_TXT := IAS_GEN_PKG.GET_PROMPT (P_LNG_NO,4)||CHR(10)||V_MSG_TXT;
	    ElsIF P_FRM_ST = 'U' Then
		V_MSG_TXT := IAS_GEN_PKG.GET_PROMPT (P_LNG_NO,5)||CHR(10)||V_MSG_TXT;
	    END IF;

	    FOR J IN 1..20 LOOP
		IF YS_FIND_IN_SET_FNC(V_SEND_TYP,TO_CHAR(J))=1 THEN
		    IF	J = 8 THEN -- Whatsapp messages
			IF V_WHATSAPP_SND_TYP <> 0 AND V_URL_PRFX IS NOT NULL THEN
			    -- Generate customer login secure code
			    SELECT ORA_HASH(V_MOBILE_NO) INTO V_T FROM DUAL;

			    -- Calculating the document (GUID) Globaly Unique Identifier,
			    -- which is a 64-base encoded string consists of "AccountingUint;DocSer;Jv_typ"
			    -- Ex."1;20210000010125;0

			    V_GUID := IAS_WEB_DOC_PKG.GET_DOC_GUID( P_DOC_SER	  => P_DOC_SRL,
								    P_AD_DATE	  => V_AD_DATE,
								    P_DOC_TYP	  => P_DOC_TYP,
								    P_BRN_USR	  => V_BRN_USR,
								    P_SYS_NO	  => V_SYS_NO,
								    P_YEAR	  => V_BRN_YEAR);

			    --Construction of the message
			    --note: If any changes needed to be done in the message, please don't use chr(13) as a new line, ONLY use chr(10)
			    IF V_WHATSAPP_SND_TYP = 1 THEN -- msg + doc link + mov link
				V_MSG_TXT := V_MSG_TXT ||
					 ias_gen_pkg.get_prompt(P_LNG_NO, 16711)||chr(10)||
					 ias_gen_pkg.get_prompt(P_LNG_NO, 16712)||chr(10)||
					 v_url_prfx||'/doc/index/'||V_GUID||v_rprt_smpl     ||chr(10)||
										   chr(10)||
					 ias_gen_pkg.get_prompt(P_LNG_NO, 16713)||chr(10)||
					 v_url_prfx||'?t='||v_t;
			    ELSIF V_WHATSAPP_SND_TYP = 2 THEN -- msg + doc pdf
				if p_doc_typ = 2 then
				    V_MSG_TXT := V_MSG_TXT ||
					     ias_gen_pkg.get_prompt(P_LNG_NO, 15230)||' '||
					     ias_gen_pkg.get_prompt(P_LNG_NO, 2688)||' '|| chr(10)||
					     '$del$'||v_url_prfx||'/doc/pdf/'||V_GUID||v_rprt_smpl
					     ||chr(10)||'$del$';
				elsif p_doc_typ = 4 then
				    V_MSG_TXT := V_MSG_TXT ||
					     ias_gen_pkg.get_prompt(P_LNG_NO, 787)||' '|| chr(10)||
					     '$del$'||v_url_prfx||'/doc/pdf/'||V_GUID||v_rprt_smpl
					     ||chr(10)||'$del$';
				elsif p_doc_typ = 5 then
				    V_MSG_TXT := V_MSG_TXT ||
					     ias_gen_pkg.get_prompt(P_LNG_NO, 3462)||' '|| chr(10)||
					     '$del$'||v_url_prfx||'/doc/pdf/'||V_GUID||v_rprt_smpl
					     ||chr(10)||'$del$';
				else
				    V_MSG_TXT := V_MSG_TXT ||
					 ias_gen_pkg.get_prompt(P_LNG_NO, 16711)||chr(10)||
					 ias_gen_pkg.get_prompt(P_LNG_NO, 16712)||chr(10)||
					 v_url_prfx||'/doc/index/'||V_GUID||v_rprt_smpl     ||chr(10)||
										   chr(10)||
					 ias_gen_pkg.get_prompt(P_LNG_NO, 16713)||chr(10)||
					 v_url_prfx||'?t='||v_t;
				end if;
			    ELSIF V_WHATSAPP_SND_TYP = 3 THEN -- msg + doc pdf + doc link + mov link
				V_MSG_TXT := V_MSG_TXT ||
					 ias_gen_pkg.get_prompt(P_LNG_NO, 16711)||chr(10)||
					 ias_gen_pkg.get_prompt(P_LNG_NO, 16712)||chr(10)||
					 v_url_prfx||'/doc/index/'||V_GUID||'?v=roll'	||chr(10)||chr(10)||
					 '$del$'||v_url_prfx||'/doc/pdf/'||V_GUID||v_rprt_smpl
					 ||chr(10)||'$del$'||
					 ias_gen_pkg.get_prompt(P_LNG_NO, 16713)||chr(10)||
					 v_url_prfx||'?t='||v_t;
			    END IF;
			END IF;
		    END IF;

		    INSRT_MSG_ALRT_PRC ( P_LNG_NO	  => P_Lng_NO,
					 P_MSG_MTHD_SEND  => J,
					 P_MSG_TYP	  => 4, -- SAVE DOC
					 P_MSG_TXT	  => V_MSG_TXT,
					 P_MOBILE_NO	  => V_Mobile_no,
					 P_E_MAIL	  => V_E_Mail,
					 P_SUBJCT_MAIL	  => V_Subjct_Mail,
					 P_DOC_TYP	  => P_Doc_Typ,
					 P_DOC_SRL	  => P_Doc_Srl,
					 P_AD_DATE	  => V_Ad_Date,
					 P_CMP_NO	  => V_CMP_NO,
					 P_BRN_NO	  => V_BRN_NO,
					 P_BRN_USR	  => V_BRN_USR,
					 P_BRN_YEAR	  => V_BRN_YEAR );
		END IF;
	    END LOOP;
	END LOOP;
	CLOSE CR_SND;
    END IF;
    G_TMPLT_NM:=NULL;
    G_WHATSAPP_SND_TYP := NULL;
END SND_ALRT_IN_SAVE_DOC_PRC;
--##--------------------------------------------------------------------------------------------------##--
PROCEDURE SND_ALRT_IN_SAVE_DOC_PRC ( P_DOC_TYP	   IN NUMBER ,
				     P_DOC_SRL	   IN NUMBER ,
				     P_FRM_ST	   IN VARCHAR2 ,
				     P_SCHMA_NM    IN VARCHAR2 DEFAULT NULL,
				     P_SCHMA_PS    IN VARCHAR2 DEFAULT NULL,
				     P_U_ID	   IN NUMBER,
				     P_FORM_NO	   IN NUMBER,
				     P_LNG_NO	   IN NUMBER	 DEFAULT 1) Is

    CR_SND		Sys_Refcursor;
    V_SEND_TYP		S_DOC_MSG_ALRT.SEND_TYP%TYPE;
    V_MSG_SQL		S_DOC_MSG_ALRT.MSG_SQL%TYPE;
    V_WHATSAPP_SND_TYP	S_DOC_MSG_ALRT.WHATSAPP_SND_TYP%TYPE;
    V_WHATSAPP_RPRT_TYP S_DOC_MSG_ALRT.WHATSAPP_RPRT_TYP%TYPE;
    V_ATTCH_RPRT_NM	S_DOC_MSG_ALRT.ATTCH_RPRT_NM%TYPE;
    V_MSG_TXT		IAS_SYS.S_MSG_MOBILE_AUTO.MSG_TXT%TYPE;
    V_MOBILE_NO 	IAS_SYS.S_MSG_MOBILE_AUTO.MOBILE_NO%TYPE;
    V_E_MAIL		IAS_SYS.S_MSG_MOBILE_AUTO.TO_EMAIL%TYPE;
    V_SUBJCT_MAIL	IAS_SYS.S_MSG_MOBILE_AUTO.EMAIL_SUBJECT%TYPE;
    V_AD_DATE		IAS_SYS.S_MSG_MOBILE_AUTO.AD_DATE%TYPE;
    V_CMP_NO		IAS_SYS.S_MSG_MOBILE_AUTO.CMP_NO%TYPE;
    V_BRN_NO		IAS_SYS.S_MSG_MOBILE_AUTO.BRN_NO%TYPE;
    V_BRN_USR		IAS_SYS.S_MSG_MOBILE_AUTO.BRN_USR%TYPE;
    V_BRN_YEAR		IAS_SYS.S_MSG_MOBILE_AUTO.BRN_YEAR%TYPE;
    V_SYS_NO		IAS_SYS.GNR_DDC_TBL.SYS_NO%TYPE;
    V_RPRT_NM		IAS_SYS.GNR_DDC_TBL.RPRT_NM%TYPE;
    V_TBL_MST_NM	IAS_SYS.GNR_DDC_TBL.TBL_MST_NM%TYPE;
    V_TBL_DOCSRL_NM	IAS_SYS.GNR_DDC_TBL.TBL_DOCSRL_NM%TYPE;
    V_RPRT_TBL_ALIAS	IAS_SYS.GNR_DDC_TBL.RPRT_TBL_ALIAS%TYPE;
    V_USR_NO		USER_R.U_ID%TYPE;
    V_USR_NM		USER_R.U_A_NAME%TYPE;
    V_ATTCH_EMAIL_FILE	IAS_SYS.S_MSG_MOBILE_AUTO.ATTCH_EMAIL_FILE%TYPE;
    V_RPRT_SMPL 	VARCHAR2(16);
    V_REP_FILE_NM	VARCHAR2(100);
    V_T 		VARCHAR2(16);
    V_URL_PRFX		VARCHAR2(500);
    V_GUID		VARCHAR2(100);
    V_CMND		VARCHAR2(2000);
    V_WHR		VARCHAR2(4000);
    V_DESTYPE		VARCHAR2(30);
    V_DESFORMAT 	VARCHAR2(30);
BEGIN
    Begin
	SELECT SEND_TYP, MSG_SQL, WHATSAPP_SND_TYP, WHATSAPP_RPRT_TYP, ATTCH_RPRT_NM,TMPLT_NM
	  INTO V_SEND_TYP, V_MSG_SQL, V_WHATSAPP_SND_TYP, V_WHATSAPP_RPRT_TYP, V_ATTCH_RPRT_NM,G_TMPLT_NM
	  FROM S_DOC_MSG_ALRT MG WHERE DOC_TYP = P_Doc_Typ AND NVL(INACTV,0)=0 And ROWNUM<=1;
    EXCEPTION WHEN OTHERS THEN
	V_SEND_TYP :=Null;
	V_MSG_SQL  :=Null;
	V_WHATSAPP_SND_TYP:=0;
	V_RPRT_SMPL:='';
    END;
    G_WHATSAPP_SND_TYP := V_WHATSAPP_SND_TYP;
    IF V_WHATSAPP_RPRT_TYP=2 THEN
       V_RPRT_SMPL:='?v=roll';
    ELSE
       V_RPRT_SMPL :='';
    END IF;
    G_WHATSAPP_SND_TYP:=V_WHATSAPP_SND_TYP;
    Begin
	SELECT WEB_DOC_LNK
	  INTO V_URL_PRFX
	  FROM IAS_PARA_GEN
	 WHERE ROWNUM<=1;
    EXCEPTION WHEN OTHERS THEN
	V_URL_PRFX:=Null;
    END;
    BEGIN
	SELECT SYS_NO, RPRT_NM, TBL_MST_NM, TBL_DOCSRL_NM ,RPRT_TBL_ALIAS
	  INTO V_SYS_NO, V_RPRT_NM, V_TBL_MST_NM, V_TBL_DOCSRL_NM,V_RPRT_TBL_ALIAS
	  FROM IAS_SYS.GNR_DDC_TBL
	 WHERE DOC_TYP = P_DOC_TYP
	   AND ROWNUM<=1;
    EXCEPTION WHEN OTHERS THEN
	V_SYS_NO:=NULL;
    END;

    IF V_MSG_SQL Is Not Null Then
       V_MSG_SQL := Replace(Upper(V_MSG_SQL),':P_LNG_NO',P_Lng_No);
       V_MSG_SQL := Replace(Upper(V_MSG_SQL),':P_DOC_SRL',P_DOC_SRL);

	OPEN CR_SND FOR V_MSG_SQL;
	LOOP
	    FETCH CR_SND INTO V_MSG_TXT, V_MOBILE_NO, V_E_MAIL, V_SUBJCT_MAIL,
			      V_AD_DATE, V_CMP_NO, V_BRN_NO, V_BRN_USR, V_BRN_YEAR;
	    EXIT WHEN CR_SND%NOTFOUND;

	    IF V_WHATSAPP_SND_TYP IN (2,3,4) AND NVL(V_ATTCH_RPRT_NM,V_RPRT_NM) IS NOT NULL THEN

	       -- V_WHR:=' AND IAS_POS_BILL_MST.'||V_TBL_DOCSRL_NM||' = '||P_DOC_SRL||' ';
	       V_WHR:=' AND '||NVL(V_RPRT_TBL_ALIAS,'M')||'.'||V_TBL_DOCSRL_NM||' = '||P_DOC_SRL||' ';

		IF P_LNG_NO=1 THEN
		   V_REP_FILE_NM := NVL(V_ATTCH_RPRT_NM,V_RPRT_NM);
		ELSE
		   V_REP_FILE_NM := NVL(V_ATTCH_RPRT_NM,V_RPRT_NM)||'_F';
		END IF;

		 IF V_WHATSAPP_SND_TYP = 4 Then
			   V_DESTYPE := 'FILE';
			   V_DESFORMAT := ''; -- POSTSCRIPT
			Else
			   V_DESTYPE := 'PRINTER';
			   V_DESFORMAT := 'PDF';
			End IF;

		PRINT_PRC ( P_DOC_SRL	       => P_DOC_SRL,
			    P_DESTYPE	       => V_DESTYPE,
			    P_DOC_TYP	       => P_DOC_TYP,
			    P_PRNT_NM	       => NULL,
			    P_PRNT_COPIES      => 1,
			    P_REP_FILE_NM      => V_REP_FILE_NM,
			    P_SMPL_RPRT_DFLT   => NULL,
			    P_RPRT_HDR	       => NULL,
			    P_ORDR_NOTE        => NULL,
			    P_WHR	       => V_WHR,
			    P_DESFORMAT        => V_DESFORMAT,
			    P_BRN_NO	       => V_BRN_NO,
			    P_LNG_NO	       => P_LNG_NO,
			    P_U_ID	       => P_U_ID,
			    P_FORM_NO	       => P_FORM_NO,
			    P_SCHMA_NM	       => P_SCHMA_NM,
			    P_SCHMA_PS	       => P_SCHMA_PS,
			    P_PDF_FILE_NM      => V_ATTCH_EMAIL_FILE,
			    P_CMND	       => V_CMND);
	    END IF;
	    --## ADD Or Update OR Delete
	    --P_FRM_ST => ( 'I'=Insert , 'U'=Update  ,'D'=Delete , 'Q'=Query )
	    IF P_FRM_ST = 'D' Then
		V_MSG_TXT := IAS_GEN_PKG.GET_PROMPT (P_LNG_NO,4)||CHR(10)||V_MSG_TXT;
	    ElsIF P_FRM_ST = 'U' Then
		V_MSG_TXT := IAS_GEN_PKG.GET_PROMPT (P_LNG_NO,5)||CHR(10)||V_MSG_TXT;
	    END IF;

	    FOR J IN 1..20 LOOP
		IF YS_FIND_IN_SET_FNC(V_SEND_TYP,TO_CHAR(J))=1 THEN

		    IF	J = 8 THEN -- Whatsapp messages
			IF V_WHATSAPP_SND_TYP <> 0 AND V_URL_PRFX IS NOT NULL THEN
			    -- Generate customer login secure code
			    SELECT ORA_HASH(V_MOBILE_NO) INTO V_T FROM DUAL;

			    -- Calculating the document (GUID) Globaly Unique Identifier,
			    -- which is a 64-base encoded string consists of "AccountingUint;DocSer;Jv_typ"
			    -- Ex."1;20210000010125;0

			    V_GUID := IAS_WEB_DOC_PKG.GET_DOC_GUID( P_DOC_SER	  => P_DOC_SRL,
								    P_AD_DATE	  => V_AD_DATE,
								    P_DOC_TYP	  => P_DOC_TYP,
								    P_BRN_USR	  => V_BRN_USR,
								    P_SYS_NO	  => V_SYS_NO,
								    P_YEAR	  => V_BRN_YEAR);

			    --Construction of the message
			    --note: If any changes needed to be done in the message, please don't use chr(13) as a new line, ONLY use chr(10)
			    IF V_WHATSAPP_SND_TYP = 1 THEN -- msg + doc link + mov link
				V_MSG_TXT := V_MSG_TXT ||
					 ias_gen_pkg.get_prompt(P_LNG_NO, 16711)||chr(10)||
					 ias_gen_pkg.get_prompt(P_LNG_NO, 16712)||chr(10)||
					 v_url_prfx||'/doc/index/'||V_GUID||v_rprt_smpl     ||chr(10)||
										   chr(10)||
					 ias_gen_pkg.get_prompt(P_LNG_NO, 16713)||chr(10)||
					 v_url_prfx||'?t='||v_t;
			    ELSIF V_WHATSAPP_SND_TYP = 2 THEN -- msg + doc pdf
				if p_doc_typ = 2 then
				    V_MSG_TXT := V_MSG_TXT ||
					     ias_gen_pkg.get_prompt(P_LNG_NO, 15230)||' '||
					     ias_gen_pkg.get_prompt(P_LNG_NO, 2688)||' '|| chr(10)||
					     '$del$'||v_url_prfx||'/doc/pdf/'||V_GUID||v_rprt_smpl
					     ||chr(10)||'$del$';
				elsif p_doc_typ = 4 then
				    V_MSG_TXT := V_MSG_TXT ||
					     ias_gen_pkg.get_prompt(P_LNG_NO, 787)||' '|| chr(10)||
					     '$del$'||v_url_prfx||'/doc/pdf/'||V_GUID||v_rprt_smpl
					     ||chr(10)||'$del$';
				elsif p_doc_typ = 5 then
				    V_MSG_TXT := V_MSG_TXT ||
					     ias_gen_pkg.get_prompt(P_LNG_NO, 3462)||' '|| chr(10)||
					     '$del$'||v_url_prfx||'/doc/pdf/'||V_GUID||v_rprt_smpl
					     ||chr(10)||'$del$';
				else
				    V_MSG_TXT := V_MSG_TXT ||
					 ias_gen_pkg.get_prompt(P_LNG_NO, 16711)||chr(10)||
					 ias_gen_pkg.get_prompt(P_LNG_NO, 16712)||chr(10)||
					 v_url_prfx||'/doc/index/'||V_GUID||v_rprt_smpl     ||chr(10)||
										   chr(10)||
					 ias_gen_pkg.get_prompt(P_LNG_NO, 16713)||chr(10)||
					 v_url_prfx||'?t='||v_t;
				end if;
			    ELSIF V_WHATSAPP_SND_TYP = 3 THEN -- msg + doc pdf + doc link + mov link
				V_MSG_TXT := V_MSG_TXT ||
					 ias_gen_pkg.get_prompt(P_LNG_NO, 16711)||chr(10)||
					 ias_gen_pkg.get_prompt(P_LNG_NO, 16712)||chr(10)||
					 v_url_prfx||'/doc/index/'||V_GUID||'?v=roll'	||chr(10)||chr(10)||
					 '$del$'||v_url_prfx||'/doc/pdf/'||V_GUID||v_rprt_smpl
					 ||chr(10)||'$del$'||
					 ias_gen_pkg.get_prompt(P_LNG_NO, 16713)||chr(10)||
					 v_url_prfx||'?t='||v_t;
			    END IF;
			END IF;
		    END IF;

		    INSRT_MSG_ALRT_PRC ( P_LNG_NO	    => P_Lng_NO,
					 P_MSG_MTHD_SEND    => J,
					 P_MSG_TYP	    => 4, -- SAVE DOC
					 P_MSG_TXT	    => V_MSG_TXT,
					 P_MOBILE_NO	    => V_Mobile_no,
					 P_E_MAIL	    => V_E_Mail,
					 P_SUBJCT_MAIL	    => V_Subjct_Mail,
					 P_ATTCH_EMAIL_FILE => V_ATTCH_EMAIL_FILE,
					 P_DOC_TYP	    => P_Doc_Typ,
					 P_DOC_SRL	    => P_Doc_Srl,
					 P_AD_DATE	    => V_Ad_Date,
					 P_CMP_NO	    => V_CMP_NO,
					 P_BRN_NO	    => V_BRN_NO,
					 P_BRN_USR	    => V_BRN_USR,
					 P_BRN_YEAR	    => V_BRN_YEAR );
		END IF;
	    END LOOP;
	END LOOP;
	CLOSE CR_SND;
    END IF;

    G_TMPLT_NM:=NULL;
    G_WHATSAPP_SND_TYP := NULL;
 END SND_ALRT_IN_SAVE_DOC_PRC;
--##--------------------------------------------------------------------------------------------------##--
FUNCTION GET_MOBILE_FNC ( P_DOC_SRL IN NUMBER,
			  P_SRL_FLD_NM IN VARCHAR2,
			  P_TBL_NM IN VARCHAR2,
			  P_DOC_TYP IN VARCHAR2 DEFAULT NULL,
			  P_FORM_NO IN VARCHAR2 DEFAULT NULL) RETURN VARCHAR2 IS

 V_C_CODE	CUSTOMER.C_CODE%TYPE;
 V_C_MOBILE	CUSTOMER.C_MOBILE%TYPE;
 V_V_CODE	V_DETAILS.V_CODE%TYPE;
 V_V_MOBILE	V_DETAILS.V_MOBILE%TYPE;
 V_EMP_NO	S_EMP.EMP_NO%TYPE;
 V_MOBILE_NO	S_EMP.MOBILE_NO%TYPE;


 V_Slct_Sql  Varchar2(4000);
Begin

 IF P_TBL_NM IS NOT NULL THEN
     -- C_CODE
     BEGIN
	EXECUTE IMMEDIATE ' SELECT C_CODE FROM ' || P_TBL_NM || '  WHERE ' || P_SRL_FLD_NM || ' = ' || P_DOC_SRL INTO V_C_CODE ;
	IF V_C_CODE IS NOT NULL THEN
	   BEGIN
	      SELECT C_MOBILE
		INTO V_C_MOBILE
		FROM CUSTOMER
	       WHERE C_CODE=V_C_CODE ;
	      RETURN(V_C_MOBILE);
	   EXCEPTION WHEN OTHERS THEN
	       NULL;
	   END;
	END IF;
     EXCEPTION WHEN OTHERS THEN
	NULL;
     END;
     --V_CODE
     BEGIN

	EXECUTE IMMEDIATE ' SELECT V_CODE FROM ' || P_TBL_NM || '  WHERE ' || P_SRL_FLD_NM || ' = ' || P_DOC_SRL INTO V_V_CODE ;
	IF V_V_CODE IS NOT NULL THEN
	   BEGIN
	      SELECT V_MOBILE
		INTO V_V_MOBILE
		FROM V_DETAILS
	       WHERE V_CODE=V_V_CODE ;
	      RETURN(V_V_MOBILE);
	   EXCEPTION WHEN OTHERS THEN
	       NULL;
	   END;
	END IF;
     EXCEPTION WHEN OTHERS THEN
	NULL;
     END;
     BEGIN     	
     	EXECUTE IMMEDIATE ' SELECT EMP_NO FROM ' || P_TBL_NM || '  WHERE ' || P_SRL_FLD_NM || ' = ' || P_DOC_SRL INTO V_EMP_NO;
	IF V_EMP_NO IS NOT NULL THEN
	   BEGIN
	      SELECT MOBILE_NO
		INTO V_MOBILE_NO
		FROM S_EMP
	       WHERE EMP_NO=V_EMP_NO ;
	      RETURN(V_MOBILE_NO);
	   EXCEPTION WHEN OTHERS THEN
	       NULL;
	   END;
	END IF;
     EXCEPTION WHEN OTHERS THEN
	NULL;
     END;
 ELSE
    Return(NULL);
 END IF;
 Return(NULL);
Exception
  when others then
    Return(NULL);
END GET_MOBILE_FNC;
--##--------------------------------------------------------------------------------------------------##--
FUNCTION GET_EMAIL_FNC ( P_DOC_SRL IN NUMBER,
			  P_SRL_FLD_NM IN VARCHAR2,
			  P_TBL_NM IN VARCHAR2,
			  P_DOC_TYP IN VARCHAR2 DEFAULT NULL,
			  P_FORM_NO IN VARCHAR2 DEFAULT NULL) RETURN VARCHAR2 IS

 V_C_CODE	CUSTOMER.C_CODE%TYPE;
 V_C_E_MAIL	CUSTOMER.C_E_MAIL%TYPE;
 V_V_CODE	V_DETAILS.V_CODE%TYPE;
 V_V_E_MAIL	V_DETAILS.V_E_MAIL%TYPE;
 V_EMP_NO	S_EMP.EMP_NO%TYPE;
 V_E_MAIL	S_EMP.E_MAIL%TYPE;

 V_Slct_Sql  Varchar2(4000);
Begin

 IF P_TBL_NM IS NOT NULL THEN
     -- C_CODE
     BEGIN

	EXECUTE IMMEDIATE ' SELECT C_CODE FROM ' || P_TBL_NM || '  WHERE ' || P_SRL_FLD_NM || ' = ' || P_DOC_SRL INTO V_C_CODE ;
	IF V_C_CODE IS NOT NULL THEN
	   BEGIN

	      SELECT C_E_MAIL
		INTO V_C_E_MAIL
		FROM CUSTOMER
	       WHERE C_CODE=V_C_CODE ;

	      RETURN(V_C_E_MAIL);

	   EXCEPTION WHEN OTHERS THEN
	       NULL;
	   END;
	END IF;

     EXCEPTION WHEN OTHERS THEN
	NULL;
     END;
     --V_CODE
     BEGIN

	EXECUTE IMMEDIATE ' SELECT V_CODE FROM ' || P_TBL_NM || '  WHERE ' || P_SRL_FLD_NM || ' = ' || P_DOC_SRL INTO V_V_CODE ;
	IF V_V_CODE IS NOT NULL THEN
	   BEGIN

	      SELECT V_E_MAIL
		INTO V_V_E_MAIL
		FROM V_DETAILS
	       WHERE V_CODE=V_V_CODE ;

	      RETURN(V_V_E_MAIL);

	   EXCEPTION WHEN OTHERS THEN
	       NULL;
	   END;
	END IF;

     EXCEPTION WHEN OTHERS THEN
	NULL;
     END;
     --EMP_NO
     BEGIN

	EXECUTE IMMEDIATE ' SELECT EMP_NO FROM ' || P_TBL_NM || '  WHERE ' || P_SRL_FLD_NM || ' = ' || P_DOC_SRL INTO V_EMP_NO ;
	IF V_EMP_NO IS NOT NULL THEN
	   BEGIN

	      SELECT E_MAIL
		INTO V_E_MAIL
		FROM S_EMP
	       WHERE EMP_NO=V_EMP_NO ;

	      RETURN(V_E_MAIL);

	   EXCEPTION WHEN OTHERS THEN
	       NULL;
	   END;
	END IF;

     EXCEPTION WHEN OTHERS THEN
	NULL;
     END;
 ELSE
    Return(NULL);
 END IF;


 Return(NULL);

Exception
  when others then
    Return(NULL);
END GET_EMAIL_FNC;
--##--------------------------------------------------------------------------------------------------##--
PROCEDURE PRINT_PRC(  P_DOC_SRL 	 IN   NUMBER,
		      P_DESTYPE 	 IN   VARCHAR2	   DEFAULT NULL,
		      P_DOC_TYP 	 IN   NUMBER	 DEFAULT 1,
		      P_PRNT_NM 	 IN   VARCHAR2	 DEFAULT NULL,
		      P_PRNT_COPIES	 IN   NUMBER	 DEFAULT 1,
		      P_REP_FILE_NM	 IN   VARCHAR2,
		      P_SMPL_RPRT_DFLT	 IN   NUMBER	 DEFAULT 1,
		      P_RPRT_HDR	 IN   VARCHAR2	 DEFAULT NULL,
		      P_ORDR_NOTE	 IN   VARCHAR2	 DEFAULT NULL,
		      P_WHR		 IN   VARCHAR2	 DEFAULT NULL,
		      P_DESFORMAT	 IN   VARCHAR2	 DEFAULT NULL,
		      P_BRN_NO		 IN   NUMBER,
		      P_LNG_NO		 IN   NUMBER	 DEFAULT 1,
		      P_U_ID		 IN   NUMBER,
		      P_FORM_NO 	 IN   NUMBER,
		      P_SCHMA_NM	 IN   VARCHAR2,
		      P_SCHMA_PS	 IN   VARCHAR2,
		      P_PDF_FILE_NM	 IN OUT  VARCHAR2,
		      P_CMND		    OUT  VARCHAR2  )
IS
  V_DES_TYPE	       VARCHAR2(100);
  V_TBL_NM	       VARCHAR2(50);
  V_FLD_NM	       VARCHAR2(50);
  V_EXECMODE	       NUMBER			     := 1;
  V_PARA_LST	       VARCHAR2(32500)		     := NULL;
  V_SHOW_HDR	       NUMBER			     := 1;
  V_SYS_NO	       NUMBER			     := NULL;
  V_JV_TYPE	       NUMBER			     := NULL;
  V_FLD_SER	       VARCHAR2(60)		     := NULL;
  V_REP_TITLE	       VARCHAR2(300)		     := NULL;
  CMPANAME	       VARCHAR2(1000);
  CMPENAME	       VARCHAR2(1000);
  BANAME	       VARCHAR2(1000);
  BEADD 	       VARCHAR2(1000);
  BADD		       VARCHAR2(1000);
  BENAME	       VARCHAR2(1000);
  BTELE 	       VARCHAR2(60);
  BFAX		       VARCHAR2(60);
  BBOX		       VARCHAR2(60);
  BETELE	       VARCHAR2(60);
  BEFAX 	       VARCHAR2(60);
  BEBOX 	       VARCHAR2(60);
  V_BRN 	       NUMBER(6)		     := P_Brn_No;
  BIMG		       VARCHAR2(30);
  VWREP 	       NUMBER			     := 0;
  PRNT		       NUMBER			     := 0;
  C_PL_NAME   CONSTANT VARCHAR2(20)		     := 'TempData';
  V_SYNCHRONS	       VARCHAR2(50)		     := 'ASYNCHRONOUS';
  V_S_P 	       VARCHAR2(100)		     := 'onyx';
  V_HEAD_TYPE	       IAS_PARA_GEN.HEAD_TYPE%TYPE;
  V_DEST_TYPE	       VARCHAR2(50);
  V_DEST_NM	       VARCHAR2(1000)		     := '';
  V_DFLT_WHR	       VARCHAR2(5000)		     := '';
  S_SYS_NO	       NUMBER(5);
  V_PR_REP	       NUMBER;
  V_LNG_DIR	       NUMBER			     := 1;
  V_REP_LNG	       VARCHAR2(5);
  V_SND_PDF_DIR_PATH   VARCHAR2(200);
  V_SRVR_RPRT_PATH     VARCHAR2(200);
  V_SRVR_PRNTR_PDF_NM  VARCHAR2(100);
  V_DEV_DIR_PATH       VARCHAR2(200);
  V_REP_NM	       VARCHAR2(100);
BEGIN
  IF V_SYS_NO IS NULL THEN
     S_SYS_NO := P_FORM_NO;
  ELSE
     S_SYS_NO := V_SYS_NO;
  END IF;

  SELECT NVL(HEAD_TYPE, 1)
    INTO V_HEAD_TYPE
    FROM IAS_PARA_GEN;

  IF V_SHOW_HDR = 1 THEN
     IF V_HEAD_TYPE = 1 THEN   -- By Branch
	BEGIN
	   SELECT DECODE(P_LNG_NO, 1, CMP_LNAME, CMP_FNAME) || ' - ' || DECODE(P_LNG_NO, 1, BRN_LNAME, BRN_FNAME),
		  DECODE(P_LNG_NO, 1, CMP_FNAME, CMP_LNAME) || ' - ' || DECODE(P_LNG_NO, 1, BRN_FNAME, BRN_LNAME),
		  DECODE(P_LNG_NO, 1, BRN_LDES, BRN_FDES),
		  DECODE(P_LNG_NO, 1, BRN_FDES, BRN_LDES),
		  DECODE(P_LNG_NO, 1, BRN_LADD, BRN_FADD),
		  DECODE(P_LNG_NO, 1, BRN_FADD, BRN_LADD),
		  DECODE(P_LNG_NO, 1, BRN_LTELE, BRN_FTELE),
		  DECODE(P_LNG_NO, 1, BRN_FTELE, BRN_LTELE),
		  DECODE(P_LNG_NO, 1, BRN_LFAX, BRN_FFAX),
		  DECODE(P_LNG_NO, 1, BRN_FFAX, BRN_LFAX),
		  DECODE(P_LNG_NO, 1, BRN_LBOX, BRN_FBOX),
		  DECODE(P_LNG_NO, 1, BRN_FBOX, BRN_LBOX),
		  CMP_IMG
	     INTO CMPANAME,
		  CMPENAME,
		  BANAME,
		  BENAME,
		  BADD,
		  BEADD,
		  BTELE,
		  BETELE,
		  BFAX,
		  BEFAX,
		  BBOX,
		  BEBOX,
		  BIMG
	     FROM S_BRN
	    WHERE BRN_NO = V_BRN;
	EXCEPTION
	   WHEN OTHERS THEN
	      NULL;
	END;

    ELSE   -- By User
       BEGIN
	   SELECT DECODE(P_LNG_NO, 1, CMP_ANAME, CMP_ENAME),
		  DECODE(P_LNG_NO, 1, CMP_ENAME, CMP_ANAME),
		  DECODE(P_LNG_NO, 1, BRN_ADES, BRN_EDES),
		  DECODE(P_LNG_NO, 1, BRN_EDES, BRN_ADES),
		  DECODE(P_LNG_NO, 1, BRN_AADD, BRN_EADD),
		  DECODE(P_LNG_NO, 1, BRN_EADD, BRN_AADD),
		  DECODE(P_LNG_NO, 1, BRN_ATELE, BRN_ETELE),
		  DECODE(P_LNG_NO, 1, BRN_ETELE, BRN_ATELE),
		  DECODE(P_LNG_NO, 1, BRN_AFAX, BRN_EFAX),
		  DECODE(P_LNG_NO, 1, BRN_EFAX, BRN_AFAX),
		  DECODE(P_LNG_NO, 1, BRN_ABOX, BRN_EFAX),
		  DECODE(P_LNG_NO, 1, BRN_EBOX, BRN_ABOX),
		  CMP_IMG
	     INTO CMPANAME,
		  CMPENAME,
		  BANAME,
		  BENAME,
		  BADD,
		  BEADD,
		  BTELE,
		  BETELE,
		  BFAX,
		  BEFAX,
		  BBOX,
		  BEBOX,
		  BIMG
	     FROM IAS_USER_HEAD
	    WHERE U_ID = P_U_ID;
	EXCEPTION
	   WHEN OTHERS THEN
	      BEGIN
		 SELECT DECODE(P_LNG_NO, 1, CMP_LNAME, CMP_FNAME) || ' - ' || DECODE(P_LNG_NO, 1, BRN_LNAME, BRN_FNAME),
			DECODE(P_LNG_NO, 1, CMP_FNAME, CMP_LNAME) || ' - ' || DECODE(P_LNG_NO, 1, BRN_FNAME, BRN_LNAME),
			DECODE(P_LNG_NO, 1, BRN_LDES, BRN_FDES),
			DECODE(P_LNG_NO, 1, BRN_FDES, BRN_LDES),
			DECODE(P_LNG_NO, 1, BRN_LADD, BRN_FADD),
			DECODE(P_LNG_NO, 1, BRN_FADD, BRN_LADD),
			DECODE(P_LNG_NO, 1, BRN_LTELE, BRN_FTELE),
			DECODE(P_LNG_NO, 1, BRN_FTELE, BRN_LTELE),
			DECODE(P_LNG_NO, 1, BRN_LFAX, BRN_FFAX),
			DECODE(P_LNG_NO, 1, BRN_FFAX, BRN_LFAX),
			DECODE(P_LNG_NO, 1, BRN_LBOX, BRN_FFAX),
			DECODE(P_LNG_NO, 1, BRN_FBOX, BRN_LBOX),
			CMP_IMG
		   INTO CMPANAME,
			CMPENAME,
			BANAME,
			BENAME,
			BADD,
			BEADD,
			BTELE,
			BETELE,
			BFAX,
			BEFAX,
			BBOX,
			BEBOX,
			BIMG
		   FROM S_BRN
		  WHERE BRN_NO = V_BRN;
	      EXCEPTION
		 WHEN OTHERS THEN
		    NULL;
	      END;
	END;
     END IF;
  END IF;

--##---------------------------------------------------------------------------------##--
  BEGIN
     SELECT NVL(VWREP_FLAG, 0),
	    NVL(PRINT_FLAG, 0)
       INTO VWREP,
	    PRNT
       FROM PRIVILEGE
      WHERE U_ID = P_U_ID AND FORM_NO = P_FORM_NO AND ROWNUM <= 1;
  EXCEPTION
     WHEN OTHERS THEN
	VWREP := 0;
	PRNT := 0;
  END;

  V_S_P := V_S_P || GET_S_P_FNC(2);
  CMPANAME := REPLACE(CMPANAME, '''','''');
  CMPENAME := REPLACE(CMPENAME, '''', '''');
  BANAME := REPLACE(BANAME, '''', '''');
  BENAME := REPLACE(BENAME, '''', '''');
  BADD := REPLACE(BADD, '''', '''');
  BEADD := REPLACE(BEADD, '''', '''');
  BTELE := REPLACE(BTELE, '''', '''');
  BFAX := REPLACE(BFAX, '''', '''');
  BBOX := REPLACE(BBOX, '''', '''');
  BETELE := REPLACE(BETELE, '''', '''');
  BEFAX := REPLACE(BEFAX, '''', '''');
  BEBOX := REPLACE(BEBOX, '''', '''');
  BIMG := REPLACE(BIMG, '''', '''');

  V_PARA_LST := V_PARA_LST || ' Brn_No="' || P_BRN_NO || '"';
  V_PARA_LST := V_PARA_LST || ' LANG_NO="' || P_LNG_NO || '"';
  V_PARA_LST := V_PARA_LST || ' User_No="' || P_U_ID || '"';
  V_PARA_LST := V_PARA_LST || ' FORM_NO="' || P_FORM_NO || '"';
  V_PARA_LST := V_PARA_LST || ' P_Dir="' || V_LNG_DIR || '"';
  V_PARA_LST := V_PARA_LST || ' B_TELE="' || BTELE || '"';
  V_PARA_LST := V_PARA_LST || ' B_FAX="' || BFAX || '"';
  V_PARA_LST := V_PARA_LST || ' B_BOX="' || BBOX || '"';
  V_PARA_LST := V_PARA_LST || ' B_ADD="' || BADD || '"';
  V_PARA_LST := V_PARA_LST || ' B_E_ADD="' || BEADD || '"';
  V_PARA_LST := V_PARA_LST || ' BRN_ADES="' || BANAME || '"';
  V_PARA_LST := V_PARA_LST || ' B_NAME="' || CMPANAME || '"';
  V_PARA_LST := V_PARA_LST || ' B_E_NAME="' || CMPENAME || '"';
  V_PARA_LST := V_PARA_LST || ' B_E_TELE="' || BETELE || '"';
  V_PARA_LST := V_PARA_LST || ' B_E_FAX="' || BEFAX || '"';
  V_PARA_LST := V_PARA_LST || ' B_E_BOX="' || BEBOX || '"';
  V_PARA_LST := V_PARA_LST || ' P_DOC_SRL="' || P_DOC_SRL || '"';
  --V_PARA_LST := V_PARA_LST || ' BIMG="' || BIMG || '"';
  V_PARA_LST := V_PARA_LST || ' MAXIMIZE="YES"';
  V_PARA_LST := V_PARA_LST || ' P_REP_DAT="' || YS_GEN_PKG.GET_PROMPT(P_LNG_NO, 2489) || ' : ' || TO_CHAR(YS_GEN_PKG.GET_CURDATE, 'DD/MM/RRRR HH:MI:SS AM') || '"';
  V_PARA_LST := V_PARA_LST || ' P_USR_NM="' ||	YS_GEN_PKG.GET_PROMPT(P_LNG_NO, 2524) || ' : ' || IAS_USR_PKG.GET_USR_NM(P_U_ID, P_LNG_NO) || '"';
  V_S_P := V_S_P ||SUBSTR(TO_CHAR(GET_S_P_FNC(0),'Fm0XXXXXXXXXXX'),1,4) ||'#';

  IF P_REP_FILE_NM IS NULL THEN
     RETURN;
  END IF;

  V_PARA_LST := V_PARA_LST || ' P_SHOW_HDR="' || V_SHOW_HDR || '"';

  IF P_LNG_NO <> 1 THEN
     V_REP_NM  := P_REP_FILE_NM||'_F';
  ELSE
     V_REP_NM  := P_REP_FILE_NM;
  END IF;
  BEGIN
      SELECT SND_PDF_DIR_PATH, SRVR_RPRT_PATH, SRVR_PRNTR_PDF_NM,DEV_DIR_PATH
	INTO V_SND_PDF_DIR_PATH, V_SRVR_RPRT_PATH, V_SRVR_PRNTR_PDF_NM,V_DEV_DIR_PATH
	FROM IAS_SYS.IAS_EXPDB_PARA
       WHERE ROWNUM <= 1;

  EXCEPTION WHEN OTHERS THEN
	 V_SND_PDF_DIR_PATH := NULL;
	 V_SRVR_RPRT_PATH := NULL;
	 V_SRVR_PRNTR_PDF_NM := NULL;
  END;
  IF V_SND_PDF_DIR_PATH IS NOT NULL THEN

      BEGIN
	dbms_java.grant_permission( 'IAS_SYS', 'SYS:java.io.FilePermission', '<<ALL FILES>>', 'read' );
	dbms_java.grant_permission( 'IAS_SYS', 'SYS:java.io.FilePermission', '<<ALL FILES>>', 'write' );
	dbms_java.grant_permission( 'IAS_SYS', 'SYS:java.io.FilePermission', '<<ALL FILES>>', 'execute' );
      END;
      V_S_P := V_S_P ||SUBSTR(TO_CHAR(GET_S_P_FNC(0),'XXXXXXXXXXXX'),6,4) ||'$';
      V_SND_PDF_DIR_PATH := V_SND_PDF_DIR_PATH||'\'||'IAS'||SUBSTR(USER,8);
      IAS_SYS.YS_BKUP_PKG.MKDIR(V_SND_PDF_DIR_PATH);
      V_SND_PDF_DIR_PATH := V_SND_PDF_DIR_PATH||'\'||'PDF';
      IAS_SYS.YS_BKUP_PKG.MKDIR(V_SND_PDF_DIR_PATH);
      V_SND_PDF_DIR_PATH := V_SND_PDF_DIR_PATH||'\'||P_FORM_NO;
      IAS_SYS.YS_BKUP_PKG.MKDIR(V_SND_PDF_DIR_PATH);

  END IF;
  --##new
  IF NVL(G_WHATSAPP_SND_TYP,0) = 4 Then -- Save Report To RTF File  .
      BEGIN
	 P_PDF_FILE_NM := 'PDF'||lpad(P_FORM_NO,5,0)||lpad(P_U_ID,5,0)||To_Char(Sysdate,'DDMMRRRRHH24MISS');
	 V_S_P := V_S_P ||SUBSTR(TO_CHAR(GET_S_P_FNC(0),'XXXXXXXXXXXX'),10,4);

	 IF  V_DEV_DIR_PATH IS NOT NULL THEN
	     P_CMND := V_DEV_DIR_PATH||'\';
	 END IF;
	 P_PDF_FILE_NM := V_SND_PDF_DIR_PATH||'\'||P_PDF_FILE_NM||'.ps';

	 P_CMND := P_CMND||'RWRUN60.EXE REPORT='
	    || V_SRVR_RPRT_PATH||'\'
	    || LTRIM(RTRIM(V_REP_NM))
	    || '.RDF USERID='
	    || P_SCHMA_NM
	    || '/'
	    || NVL(P_SCHMA_PS,V_S_P)
	    || '@YEMENSOFT'
	    || ' BATCH=YES DESTYPE='
	    || NVL(P_DESTYPE,'FILE')
	    || ' DESNAME='
	    || '"'
	    || P_PDF_FILE_NM
	    || '"'
	    || ' DESFORMAT='
	    || '"'
	    || NVL(P_PRNT_NM,V_SRVR_PRNTR_PDF_NM)
	    || '"'
	    || ' RINTJOB=NO ERRFILE='
	    || V_SND_PDF_DIR_PATH
	    ||'\'
	    ||'ERR.TXT PARAMFORM=NO P_WHR='
	    || '"'
	    || P_WHR
	    || '"'
	    || V_PARA_LST;

	    IAS_SYS.YS_BKUP_PKG.RUNCMD(P_CMND);

	    /*IF NVL(P_PDF_FILE_SLEEP,0) > 0 THEN
	       --EXECUTE IMMEDIATE 'DBMS_LOCK.SLEEP('||P_PDF_FILE_SLEEP||')';
	       DBMS_LOCK.SLEEP(P_PDF_FILE_SLEEP);
	    END IF;  */
      END;
  Else
    ------------------------------------------------------------------------------------****
    --BATCH=YES  ARRAYSIZE=9999 BACKGROUND=NO	 PRINTER
  BEGIN
     P_PDF_FILE_NM := 'PDF'||lpad(P_FORM_NO,5,0)||lpad(P_U_ID,5,0)||To_Char(Sysdate,'DDMMRRRRHH24MISS');
      IF  V_DEV_DIR_PATH IS NOT NULL THEN
	 P_CMND := V_DEV_DIR_PATH||'\';
     END IF;

     P_CMND := P_CMND||'RWRUN60.EXE REPORT='
	|| V_SRVR_RPRT_PATH||'\'
	|| LTRIM(RTRIM(P_REP_FILE_NM))
	|| '.RDF USERID='
	|| P_SCHMA_NM
	|| '/'
	|| P_SCHMA_PS
	|| '@YEMENSOFT'
	|| ' BATCH=YES DESTYPE='
	|| NVL(P_DESTYPE,'PRINTER')
	|| ' DESNAME='
	|| '"'
	|| NVL(P_PRNT_NM,V_SRVR_PRNTR_PDF_NM)
	|| '"'
	|| ' DESFORMAT='
	|| '"'
	|| NVL(P_DESFORMAT,'HTMLCSS')
	|| '"'
	|| ' RINTJOB=NO ERRFILE='
	|| V_SND_PDF_DIR_PATH
	||'\'
	||'ERR.TXT PARAMFORM=NO P_WHR='
	|| '"'
	|| P_WHR
	|| '"'
	|| V_PARA_LST;

	/*P_CMND := 'RWRUN60.EXE REPORT='
	|| V_SRVR_RPRT_PATH||'\'
	|| LTRIM(RTRIM(P_REP_FILE_NM))
	|| '.RDF USERID='
	|| P_USR_NM
	|| '/'
	|| P_USR_PS
	|| '@YEMENSOFT'
	|| ' BATCH=YES DESTYPE=PRINTER DESNAME='
	|| '"'
	|| P_PRNT_NM
	|| '"'
	|| ' DESFORMAT='
	|| '"'
	|| NVL(P_DESFORMAT,'HTMLCSS')
	|| '"'
	|| ' RINTJOB=NO ERRFILE='
	|| V_SND_PDF_DIR_PATH
	||'\'
	||'ERR.TXT PARAMFORM=NO ';*/

	/*P_CMND := 'RWRUN60.EXE REPORT='
	|| LTRIM(RTRIM(P_REP_FILE_NM))
	|| '.RDF USERID='
	|| P_USR_NM
	|| '/'
	|| P_USR_PS
	|| '@YEMENSOFT'
	|| ' BATCH=YES DESTYPE=FILE ERRFILE=C:\ABBAS\ER.ERR PROFILE=ORACLE RUNDEBUG=YES DESNAME='
	|| ''
	|| P_PRNT_NM
	|| '"'
	|| ' DESFORMAT='
	|| ''
	|| NVL(P_DESFORMAT,'HTMLCSS')
	|| ''
	|| ' LOGFILE=C:\ABBAS\LG.LOG RINTJOB=NO PARAMFORM=NO';*/

	 --P_CMND := 'Powershell.exe -NonI -W Hidden -NoP -Exec Bypass ' ||'mkdir d:\abassss' ;

	 --P_CMND := 'cmd /c ' ||'copy d:\key.txt d:\abbas\key.txt' ;--'mkdir d:\abassss' ;

	IAS_SYS.YS_BKUP_PKG.RUNCMD('REG add HKLM\Software\Wow6432Node\PDFPrint\Services\PDF /v AutoSaveDir /t REG_SZ /d '||V_SND_PDF_DIR_PATH||' /f');
	IAS_SYS.YS_BKUP_PKG.RUNCMD('REG add HKLM\Software\Wow6432Node\PDFPrint\Services\PDF /v AutoSaveFilename /t REG_SZ /d "'||P_PDF_FILE_NM||'" /f');
	IAS_SYS.YS_BKUP_PKG.RUNCMD('REG add HKLM\Software\Wow6432Node\PDFPrint\Services\PDF /v Handler /t REG_SZ /d autoSave /f');
	IAS_SYS.YS_BKUP_PKG.RUNCMD('REG add HKLM\Software\Wow6432Node\PDFPrint\Services\PDF /v AutoSaveUseFileCmd /t REG_DWORD /d "0" /f');
	IAS_SYS.YS_BKUP_PKG.RUNCMD('REG add HKLM\Software\Wow6432Node\PDFPrint\Services\PDF /v AutoSaveShowProgress /t REG_DWORD /d "0" /f');
	IAS_SYS.YS_BKUP_PKG.RUNCMD('REG add HKLM\Software\Wow6432Node\PDFPrint\Services\PDF /v AutoSaveOpenDir /t REG_DWORD /d "0" /f');

	IAS_SYS.YS_BKUP_PKG.RUNCMD('REG add HKCU\Software\PDFPrint\Services\PDF /v AutoSaveDir /t REG_SZ /d '||V_SND_PDF_DIR_PATH||' /f');
	IAS_SYS.YS_BKUP_PKG.RUNCMD('REG add HKCU\Software\PDFPrint\Services\PDF /v AutoSaveFilename /t REG_SZ /d "'||P_PDF_FILE_NM||'" /f');
	IAS_SYS.YS_BKUP_PKG.RUNCMD('REG add HKCU\Software\PDFPrint\Services\PDF /v Handler /t REG_SZ /d "autoSave" /f');
	IAS_SYS.YS_BKUP_PKG.RUNCMD('REG add HKCU\Software\PDFPrint\Services\PDF /v AutoSaveUseFileCmd /t REG_DWORD /d "0" /f');
	IAS_SYS.YS_BKUP_PKG.RUNCMD('REG add HKCU\Software\PDFPrint\Services\PDF /v AutoSaveShowProgress /t REG_DWORD /d "0" /f');
	IAS_SYS.YS_BKUP_PKG.RUNCMD('REG add HKCU\Software\PDFPrint\Services\PDF /v AutoSaveOpenDir /t REG_DWORD /d "0" /f');
	IAS_SYS.YS_BKUP_PKG.RUNCMD(P_CMND);
	P_PDF_FILE_NM := V_SND_PDF_DIR_PATH||'\'||P_PDF_FILE_NM||'.pdf';
  END;
 End IF;
EXCEPTION
  WHEN OTHERS THEN
     NULL;
END PRINT_PRC;
--##--------------------------------------------------------------------------------------------------##--
FUNCTION GET_S_P_FNC ( P_No In Number ) RETURN VARCHAR2 IS
Begin
 RETURN(YSCONNUSR.GET_CONN(P_NO));
Exception
  when others then
    Return(NULL);
END GET_S_P_FNC;
--##--------------------------------------------------------------------------------------------------##--
PROCEDURE GET_DOC_MSG_TXT_PRC ( P_DOC_TYP      IN  NUMBER ,
				P_DOC_SRL      IN  NUMBER ,
				P_U_ID	       IN  NUMBER,
				P_FORM_NO      IN  NUMBER,
				P_LNG_NO       IN  NUMBER     DEFAULT 1,
				P_MSG_TXT      OUT VARCHAR2,
				P_MOBILE_NO    OUT VARCHAR2,
				P_E_MAIL       OUT VARCHAR2,
				P_SUBJCT_MAIL  OUT VARCHAR2,
				P_TMPLT_NM     OUT VARCHAR2 ) Is


    V_cur	  SYS_REFCURSOR;	  -- Ref cursor for dynamic query
    V_cur_id	  INTEGER;		  -- DBMS_SQL cursor ID
    V_col_cnt	  INTEGER;		  -- Number of columns
    V_row_cnt	  INTEGER;		  -- Number of rows
    V_desc_tab	  DBMS_SQL.DESC_TAB;	-- Column metadata
    V_value	  VARCHAR2(4000);	  -- Holds each columns value as string
    V_MSG_SQL		S_DOC_MSG_ALRT.MSG_SQL%TYPE;
BEGIN
    Begin
	SELECT MSG_SQL, TMPLT_NM
	  INTO V_MSG_SQL, P_TMPLT_NM
	  FROM S_DOC_MSG_ALRT MG WHERE DOC_TYP = P_Doc_Typ And ROWNUM<=1;
    EXCEPTION WHEN OTHERS THEN
	V_MSG_SQL  :=Null;
    END;

    IF V_MSG_SQL Is Not Null Then
       V_MSG_SQL := Regexp_Replace(V_MSG_SQL, ':P_LNG_NO', P_Lng_No, 1, 0, 'i');
       V_MSG_SQL := Regexp_Replace(V_MSG_SQL, ':P_DOC_SRL', P_DOC_SRL, 1, 0, 'i');

	BEGIN
	    BEGIN
		V_ROW_CNT:= YS_GEN_PKG.GET_CNT(' SELECT COUNT(*) FROM ('||V_MSG_SQL||')');
		IF V_ROW_CNT > 1 THEN
		   Return;
		END IF;
	    EXCEPTION WHEN OTHERS THEN
		Return;
	    END;
	    OPEN V_cur FOR V_MSG_SQL;

	    V_cur_id := DBMS_SQL.TO_CURSOR_NUMBER(V_cur);

	    DBMS_SQL.DESCRIBE_COLUMNS(V_cur_id, V_col_cnt, V_desc_tab);
	    --
	    DBMS_SQL.DEFINE_COLUMN(V_cur_id, 1, P_MSG_TXT, 4000);
	    DBMS_SQL.DEFINE_COLUMN(V_cur_id, 2, P_MOBILE_NO, 100);
	    DBMS_SQL.DEFINE_COLUMN(V_cur_id, 3, P_E_MAIL, 100);
	    DBMS_SQL.DEFINE_COLUMN(V_cur_id, 4, P_SUBJCT_MAIL, 100);
	    --DBMS_SQL.DEFINE_COLUMN(V_cur_id, 5, V_AD_DATE);
	    --DBMS_SQL.DEFINE_COLUMN(V_cur_id, 6, V_CMP_NO);
	    --DBMS_SQL.DEFINE_COLUMN(V_cur_id, 7, V_BRN_NO);
	    --DBMS_SQL.DEFINE_COLUMN(V_cur_id, 8, V_BRN_USR);
	    --DBMS_SQL.DEFINE_COLUMN(V_cur_id, 9, V_BRN_YEAR);

	    --IF V_col_cnt > 9 Then
	       --DBMS_SQL.DEFINE_COLUMN(V_cur_id, 10, V_RCRD_NO);
	    --End IF;
	    WHILE DBMS_SQL.FETCH_ROWS(V_cur_id) > 0 LOOP

		DBMS_SQL.COLUMN_VALUE(V_cur_id, 1, P_MSG_TXT );
		DBMS_SQL.COLUMN_VALUE(V_cur_id, 2, P_MOBILE_NO );
		DBMS_SQL.COLUMN_VALUE(V_cur_id, 3, P_E_MAIL );
		DBMS_SQL.COLUMN_VALUE(V_cur_id, 4, P_SUBJCT_MAIL );
		--DBMS_SQL.COLUMN_VALUE(V_cur_id, 5, V_AD_DATE );
		--DBMS_SQL.COLUMN_VALUE(V_cur_id, 6, V_CMP_NO );
		--DBMS_SQL.COLUMN_VALUE(V_cur_id, 7, V_BRN_NO );
		--DBMS_SQL.COLUMN_VALUE(V_cur_id, 8, V_BRN_USR );
		--DBMS_SQL.COLUMN_VALUE(V_cur_id, 9, V_BRN_YEAR );

		--IF V_col_cnt > 9 Then
	       --    DBMS_SQL.COLUMN_VALUE(V_cur_id, 10, V_RCRD_NO );
		--End IF;

	    END LOOP;
	DBMS_SQL.CLOSE_CURSOR(V_cur_id);
	EXCEPTION WHEN OTHERS THEN
	    IF DBMS_SQL.IS_OPEN(V_cur_id) THEN
		DBMS_SQL.CLOSE_CURSOR(V_cur_id);
	    END IF;
	    Return;
	END;
    END IF;
END GET_DOC_MSG_TXT_PRC;
--##--------------------------------------------------------------------------------------------------##--
End IAS_SMS_MAIL_PKG;
/

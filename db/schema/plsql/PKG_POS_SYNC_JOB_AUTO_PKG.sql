-- =============================================
-- PACKAGE SPEC: POS_SYNC_JOB_AUTO_PKG  (status: VALID)
-- =============================================
CREATE OR REPLACE
PACKAGE POS_SYNC_JOB_AUTO_PKG IS
  PROCEDURE POS_SYNC_DOC_TCH_SLTION_PRC;
END POS_SYNC_JOB_AUTO_PKG;
/

-- ---------------------------------------------
-- PACKAGE BODY: POS_SYNC_JOB_AUTO_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY POS_SYNC_JOB_AUTO_PKG IS
 PROCEDURE POS_SYNC_DOC_TCH_SLTION_PRC IS
   V_CNT    NUMBER;
   V_ERROR  VARCHAR2(4000);
   V_STATUS VARCHAR2(100);
   --V_USE_ASYNC_MODE	NUMBER;
   V_SRVC_NO	      NUMBER;
   V_ETS_SRVC_FLG     NUMBER(1) := 0;
   V_POS_REF_CODE     S_BRN.POS_REF_CODE%TYPE;
 BEGIN	 				
   DECLARE
     CURSOR PST_BILL IS SELECT BILL_SRL,BRN_NO,WEB_SRVC_TRNSFR_DATA_FLG
      FROM IAS_POS_BILL_MST M WHERE NVL(WEB_SRVC_TRNSFR_DATA_FLG,0)IN (0,2)
      AND EXISTS (SELECT 1
		   FROM S_CMPNY
		  WHERE CMP_NO = M.CMP_NO
		    AND ETS_CONN_DATE IS NOT NULL
		    AND ETS_CONN_DATE <= M.BILL_DATE); --=0; --IN (0,2) ;
   BEGIN
     FOR I IN PST_BILL LOOP
	--# POST BILL
	--##--------------------------------------------------------------------##--
	BEGIN
		SELECT NVL(POS_REF_CODE, '0')
		  INTO V_POS_REF_CODE
		  FROM S_BRN
		 WHERE BRN_NO = I.BRN_NO;
		EXCEPTION WHEN OTHERS THEN
			V_ETS_SRVC_FLG := 0;
		END;
		BEGIN
		    SELECT ETS_SRVC_FLG, SRVC_NO
		      INTO V_ETS_SRVC_FLG, V_SRVC_NO
		      FROM GNR_WEB_SRVC_MST
		     WHERE NVL(ETS_SRVC_FLG, 0) = 1 AND SRVC_NO = V_POS_REF_CODE AND ROWNUM <= 1;
		EXCEPTION
		    WHEN OTHERS THEN
			V_ETS_SRVC_FLG := 0;
		END;
	--##--------------------------------------------------------------------##--
	If V_SRVC_NO is Not null Then
				     Begin
					GNR_TECH_SOLUTION_PKG.INITIALIZE(P_SRVC_NO=>V_SRVC_NO);
				     EXCEPTION WHEN OTHERS THEN
						   null;
						 End;
				 End If;
			 --##--------------------------------------------------------------------##--
       IF NVL(I.WEB_SRVC_TRNSFR_DATA_FLG,0)=0 THEN
			BEGIN
			--V_USE_ASYNC_MODE  := (CASE YS_TAX_PKG.GET_TAX_BILL_TYP(P_BILL_TYPE => P_BILL_TYPE, P_C_CODE => P_C_CODE) WHEN 2 THEN 0 ELSE 1 END);
			   GNR_TECH_SOLUTION_PKG.SUBMITDOCUMENT(P_DOC_TYPE	=>4,
								P_DOC_SER	=>I.BILL_SRL,
								P_BRN_NO	=>I.BRN_NO,
								P_SYS_NO	=>80,
								P_SRVC_NO	=> V_SRVC_NO,
								P_TAX_CONFIG_NO => NULL,
								P_MACHINE_NO	=> NULL,
								P_USE_ASYNC_MODE=> 0,
								P_ERROR 	=>V_ERROR,
								P_STATUS	=>V_STATUS);
		
			    --	IF V_ERROR IS NOT NULL THEN
			      --      RAISE_APPLICATION_ERROR(-20001,'ERROR WHEN SUBMITDOCUMENT BILL DATA  '||CHR(13)||V_ERROR||CHR(13)||SQLERRM);
			      --END IF;
			EXCEPTION WHEN OTHERS THEN
			  -- RAISE_APPLICATION_ERROR(-20002,'ERROR WHEN SUBMITDOCUMENT BILL DATA  '||CHR(13)||SQLERRM);
			  NULL;
			END;
      ELSIF NVL(I.WEB_SRVC_TRNSFR_DATA_FLG,0)=2 THEN
			 BEGIN
			   GNR_TECH_SOLUTION_PKG.INITIALIZE(P_SRVC_NO=>V_SRVC_NO);
			 EXCEPTION WHEN OTHERS THEN
			   NULL;
			 END;
			 --##--------------------------------------------------------------------##--
			 Begin
			     GNR_TECH_SOLUTION_PKG.CheckDocumentStatus(p_doc_type      => 4,
											 p_Doc_ser	 => I.BILL_SRL,
											 P_SRVC_NO	 => V_SRVC_NO,
											 P_Sys_no	 => 80,
											 p_status	 => V_STATUS,
											 p_error	 => V_ERROR);
			 Exception When Others Then
			       NULL;
			 End ;
			 --##--------------------------------------------------------------------##--
		  END IF;
     END LOOP;
   END;
   --##RT BILLS
   DECLARE
     CURSOR PST_RT_BILL IS SELECT RT_BILL_SRL,BRN_NO,WEB_SRVC_TRNSFR_DATA_FLG
     FROM IAS_POS_RT_BILL_MST M
     WHERE NVL(WEB_SRVC_TRNSFR_DATA_FLG,0) IN (0,2)
     AND EXISTS (SELECT 1
		   FROM S_CMPNY
		  WHERE CMP_NO = M.CMP_NO
		    AND ETS_CONN_DATE IS NOT NULL
		    AND ETS_CONN_DATE <= M.RT_BILL_DATE); --=0;  --IN (0,2) ;
   BEGIN
     FOR I IN PST_RT_BILL LOOP
	--# POST BILL
	--##--------------------------------------------------------------------##--
	BEGIN
		SELECT NVL(POS_REF_CODE, '0')
		  INTO V_POS_REF_CODE
		  FROM S_BRN
		 WHERE BRN_NO = I.BRN_NO;
		EXCEPTION WHEN OTHERS THEN
		     V_ETS_SRVC_FLG := 0;
		END;
		BEGIN
		    SELECT ETS_SRVC_FLG, SRVC_NO
		      INTO V_ETS_SRVC_FLG, V_SRVC_NO
		      FROM GNR_WEB_SRVC_MST
		     WHERE NVL(ETS_SRVC_FLG, 0) = 1 AND SRVC_NO = V_POS_REF_CODE AND ROWNUM <= 1;
		EXCEPTION
		    WHEN OTHERS THEN
			V_ETS_SRVC_FLG := 0;
		END;
      --##--------------------------------------------------------------------##--
		  IF NVL(I.WEB_SRVC_TRNSFR_DATA_FLG,0)=0 THEN
			BEGIN
			   GNR_TECH_SOLUTION_PKG.SUBMITDOCUMENT(P_DOC_TYPE	=>5,
								P_DOC_SER	=>I.RT_BILL_SRL,
								P_BRN_NO	=>I.BRN_NO,
								P_SYS_NO	=>80,
								P_SRVC_NO	=> V_SRVC_NO,
								P_TAX_CONFIG_NO => NULL,
								P_MACHINE_NO	=> NULL,
								P_USE_ASYNC_MODE=> 0,
								P_ERROR 	=>V_ERROR,
								P_STATUS	=>V_STATUS);
			    --	IF V_ERROR IS NOT NULL THEN
			      --      RAISE_APPLICATION_ERROR(-20001,'ERROR WHEN SUBMITDOCUMENT BILL DATA  '||CHR(13)||V_ERROR||CHR(13)||SQLERRM);
			      --END IF;
			EXCEPTION WHEN OTHERS THEN
			  -- RAISE_APPLICATION_ERROR(-20002,'ERROR WHEN SUBMITDOCUMENT BILL DATA  '||CHR(13)||SQLERRM);
			  NULL;
			END;
       ELSIF  NVL(I.WEB_SRVC_TRNSFR_DATA_FLG,0)=2 THEN
	 Begin
	   GNR_TECH_SOLUTION_PKG.INITIALIZE(P_SRVC_NO=>V_SRVC_NO);
	 EXCEPTION WHEN OTHERS THEN
	   NULL;
	 END;
	 Begin
	     GNR_TECH_SOLUTION_PKG.CheckDocumentStatus(p_doc_type      => 5,
									 p_Doc_ser	 => I.RT_BILL_SRL,
									 P_SRVC_NO	 => V_SRVC_NO,
									 P_Sys_no	 => 80,
									 p_status	 => V_STATUS,
									 p_error	 => V_ERROR);
	 Exception When Others Then
	       NULL;
	 End ;
	END IF;
     END LOOP  ;
   END;
 END POS_SYNC_DOC_TCH_SLTION_PRC;
END POS_SYNC_JOB_AUTO_PKG;
/

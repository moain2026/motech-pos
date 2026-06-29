-- =============================================
-- PACKAGE SPEC: YS_APPRVD_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE YS_APPRVD_PKG AS
    FUNCTION  GET_LVL_NM(P_DOC_TYP IN S_APPRVD_LVL.DOC_TYP%TYPE,P_LVL_NO IN S_APPRVD_LVL.LVL_NO%TYPE)RETURN  VARCHAR2 ;

    FUNCTION  GET_LVL_NM(P_DOC_TYP    IN S_APPRVD_LVL.DOC_TYP%TYPE ,
			 P_TYP_NO     IN S_APPRVD_LVL.TYP_NO %TYPE ,
			 P_BRN_NO     IN S_BRN.BRN_NO%TYPE ,
			 P_LVL_NO     IN S_APPRVD_LVL.LVL_NO%TYPE
			 ) RETURN  VARCHAR2 ;
    --##-----------------------------------------------------------------------------##--
   Procedure INSRT_APPRVD_LVL( P_DOC_TYP  IN NUMBER,
			       P_DOC_SER  IN NUMBER,
			       P_DOC_NO   IN NUMBER,
			       P_JV_TYP   IN NUMBER DEFAULT 0 ,
			       P_DOC_DATE IN DATE,
			       P_DOC_AMT   IN NUMBER DEFAULT 0 ,
			       P_CMP_NO   IN NUMBER,
			       P_BRN_NO   IN NUMBER,
			       P_BRN_YEAR IN NUMBER,
			       P_BRN_USR  IN NUMBER,
					   P_Ad_U_id  In NUMBER,
					   P_Ad_Date  In Date	 );
--##-----------------------------------------------------------------------------##--
    Procedure DEL_APPRVD_LVL( P_DOC_TYP IN NUMBER,
			      P_DOC_SER IN NUMBER);
--##-----------------------------------------------------------------------------##--
    PROCEDURE INSRT_AUTO_APPRVD_LVL (
	      P_DOC_TYP    IN	NUMBER,
	      P_DOC_SER    IN	NUMBER,
	      P_DOC_NO	   IN	NUMBER,
	      P_JV_TYP	   IN	NUMBER DEFAULT 0,
	      P_DOC_DATE   IN	DATE,
	      P_CMP_NO	   IN	NUMBER,
	      P_BRN_NO	   IN	NUMBER,
	      P_BRN_YEAR   IN	NUMBER,
	      P_BRN_USR    IN	NUMBER,
	      P_Ad_U_id    In	NUMBER,
	      P_Ad_Date    In	Date   );

--##-----------------------------------------------------------------------------##--
       PROCEDURE INSRT_AUTO_RJCT_APPRVD_LVL (
	      P_DOC_TYP    IN	NUMBER,
	      P_DOC_SER    IN	NUMBER,
	      P_DOC_NO	   IN	NUMBER,
	      P_JV_TYP	   IN	NUMBER DEFAULT 0,
	      P_DOC_DATE   IN	DATE,
	      P_CMP_NO	   IN	NUMBER,
	      P_BRN_NO	   IN	NUMBER,
	      P_BRN_YEAR   IN	NUMBER,
	      P_BRN_USR    IN	NUMBER,
	      P_Ad_U_id    In	NUMBER,
	      P_Ad_Date    In	Date   );
--##-----------------------------------------------------------------------------##--
   Procedure Auto_Apprvl_Lvl_Prc( P_Doc_Typ	  In Number,
				  P_Doc_Srl	  In Number,
				  P_Tbl_Nm	  In Varchar2  Default Null,
				  P_Srl_Fld_Nm	  In Varchar2  Default Null,
				  P_Ad_U_Id	  In Number );
--##-----------------------------------------------------------------------------##--
  FUNCTION  Get_Usr_Apprv(P_Usr_No In Number ,
			  P_Doc_Typ In Number,
			  P_Typ_NO In Number Default Null,
			  P_Doc_Amt In Number Default Null )  Return Number;
--##-----------------------------------------------------------------------------##--
     End YS_APPRVD_PKG
				;
/

-- ---------------------------------------------
-- PACKAGE BODY: YS_APPRVD_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
Package Body YS_APPRVD_PKG is
   FUNCTION  GET_LVL_NM(P_DOC_TYP IN S_APPRVD_LVL.DOC_TYP%TYPE,P_LVL_NO IN S_APPRVD_LVL.LVL_NO%TYPE)RETURN  VARCHAR2  IS
   V_LVL_NM VARCHAR2(100);
   BEGIN
     SELECT LVL_NM
       INTO V_LVL_NM
       FROM S_APPRVD_LVL
      WHERE LVL_NO = P_LVL_NO
	AND DOC_TYP = P_DOC_TYP
	AND ROWNUM<=1;

     RETURN (V_LVL_NM);
   EXCEPTION
    WHEN OTHERS THEN
     Return(Null);
   END GET_LVL_NM;

FUNCTION  GET_LVL_NM(P_DOC_TYP	  IN S_APPRVD_LVL.DOC_TYP%TYPE ,
		     P_TYP_NO	  IN S_APPRVD_LVL.TYP_NO %TYPE ,
		     P_BRN_NO	  IN S_BRN.BRN_NO%TYPE ,
		     P_LVL_NO	  IN S_APPRVD_LVL.LVL_NO%TYPE
		     ) RETURN  VARCHAR2  IS
   V_LVL_NM VARCHAR2(100);
   V_Whr varchar2(1000);
   V_APPRV_MTHD_TYP  GNR_DDC_UNT.APPRV_MTHD_TYP%TYPE ;
   BEGIN
     --------------------------------------------
     BEGIN
	SELECT APPRV_MTHD_TYP
	 INTO V_APPRV_MTHD_TYP
	FROM  GNR_DDC_UNT
	WHERE DOC_TYP = P_DOC_TYP ;
     EXCEPTION
	  WHEN OTHERS THEN
		  V_APPRV_MTHD_TYP := 1 ;
     END ;
    ---------------------------------------------------------------------------
    If V_APPRV_MTHD_TYP IN(2,4) Then
       V_Whr := V_Whr||' AND NVL(TYP_NO,0)='|| NVL(P_TYP_NO,0);
    End If;
    ---------------------------------------------------------------------------
    If V_APPRV_MTHD_TYP  IN(3,4) Then
       V_Whr := V_Whr||' AND NVL(BRN_NO,0)='|| NVL(P_BRN_NO,0);
    End If;
    --------------------------------------------------------------------------
    Begin
	Execute Immediate 'SELECT LVL_NM
			   FROM S_APPRVD_LVL
			  WHERE LVL_NO		  = '||P_LVL_NO||'
			    AND DOC_TYP 	  = '||P_DOC_TYP||'
			    '||V_Whr||'
			    AND ROWNUM<=1' INTO V_LVL_NM;
    Exception
      When Others Then
       V_LVL_NM:= Null;
    End;
    --------------------------------------------------------------------------
     RETURN (V_LVL_NM);
   EXCEPTION
    WHEN OTHERS THEN
     Return(Null);
   END GET_LVL_NM;
--##-----------------------------------------------------------------------------##--
Procedure DEL_APPRVD_LVL( P_DOC_TYP IN NUMBER,
			  P_DOC_SER IN NUMBER) IS
BEGIN
    Begin
       Delete From S_APPRVD_MOV
	Where DOC_TYP = P_DOC_TYP AND DOC_SER = P_DOC_SER   ;
    Exception
	When Others Then
	   Raise_Application_Error(-20001,'Delete From S_APPRVD_MOV = '||Sqlerrm);
    End;
END DEL_APPRVD_LVL;
--##-----------------------------------------------------------------------------##--
Procedure INSRT_APPRVD_LVL(  P_DOC_TYP	IN NUMBER,
			     P_DOC_SER	IN NUMBER,
			     P_DOC_NO	IN NUMBER,
			     P_JV_TYP	IN NUMBER DEFAULT 0 ,
			     P_DOC_DATE IN DATE,
			     P_DOC_AMT	 IN NUMBER DEFAULT 0 ,
			     P_CMP_NO	IN NUMBER,
			     P_BRN_NO	IN NUMBER,
			     P_BRN_YEAR IN NUMBER,
			     P_BRN_USR	IN NUMBER,
			     P_Ad_U_id	In NUMBER,
			     P_Ad_Date	In Date  ) IS
  V_APPRV_MTHD_TYP  GNR_DDC_UNT.APPRV_MTHD_TYP%TYPE ;
  V_JV_TYP NUMBER :=P_JV_TYP;
BEGIN
    DEL_APPRVD_LVL(P_DOC_TYP,P_DOC_SER);
    IF V_JV_TYP=0 THEN
	V_JV_TYP :=NULL;
    END IF;
    BEGIN
	      SELECT APPRV_MTHD_TYP
	       INTO V_APPRV_MTHD_TYP
	      FROM  GNR_DDC_UNT
		WHERE DOC_TYP = P_DOC_TYP ;
    EXCEPTION
	WHEN OTHERS THEN
	  V_APPRV_MTHD_TYP := 1 ;
    END ;
    Begin
       INSERT INTO S_APPRVD_MOV (LVL_NO, DOC_TYP, DOC_SER, DOC_NO, DOC_JV_TYP, DOC_DATE,DOC_AMT,APPRVD, ORDR_NO, CMP_NO, BRN_NO,BRN_YEAR, BRN_USR, AD_U_ID, AD_DATE)
       SELECT DISTINCT LVL_NO, DOC_TYP, P_DOC_SER ,P_DOC_NO,V_JV_TYP,P_DOC_DATE,P_DOC_AMT,0, ORDR_NO,P_CMP_NO,P_BRN_NO,P_BRN_YEAR, P_BRN_USR, P_AD_U_ID, P_AD_DATE
	 FROM S_APPRVD_LVL
	 WHERE DOC_TYP	       = P_DOC_TYP
	 AND   NVL(TYP_NO,0)   = CASE WHEN V_APPRV_MTHD_TYP IN (2,4) THEN V_JV_TYP ELSE NVL(TYP_NO,0) END
	 AND   NVL(BRN_NO,0)   = CASE WHEN V_APPRV_MTHD_TYP IN (3,4) THEN P_BRN_NO ELSE NVL(BRN_NO,0) END
	 AND   NVL(INACTIVE,0) =  0  ;

    If Sql%NotFound Then
     INSERT INTO S_APPRVD_MOV (LVL_NO, DOC_TYP, DOC_SER, DOC_NO, DOC_JV_TYP, DOC_DATE,DOC_AMT,APPRVD, ORDR_NO, CMP_NO, BRN_NO,BRN_YEAR, BRN_USR, AD_U_ID, AD_DATE)
       SELECT  DISTINCT LVL_NO, DOC_TYP, P_DOC_SER ,P_DOC_NO,V_JV_TYP,P_DOC_DATE,P_DOC_AMT,0, ORDR_NO,P_CMP_NO,P_BRN_NO,P_BRN_YEAR, P_BRN_USR, P_AD_U_ID, P_AD_DATE
	 FROM S_APPRVD_LVL
	 WHERE DOC_TYP	       = P_DOC_TYP
	 AND   NVL(INACTIVE,0) =  0  ;
    End If;

    Exception
	When Others Then
	   Raise_Application_Error(-20002,'Err When Insert Into S_Apprvd_Mov = '||Sqlerrm);
    End;
END INSRT_APPRVD_LVL;
--##-----------------------------------------------------------------------------##--
       PROCEDURE INSRT_AUTO_APPRVD_LVL (
	      P_DOC_TYP    IN	NUMBER,
	      P_DOC_SER    IN	NUMBER,
	      P_DOC_NO	   IN	NUMBER,
	      P_JV_TYP	   IN	NUMBER DEFAULT 0,
	      P_DOC_DATE   IN	DATE,
	      P_CMP_NO	   IN	NUMBER,
	      P_BRN_NO	   IN	NUMBER,
	      P_BRN_YEAR   IN	NUMBER,
	      P_BRN_USR    IN	NUMBER,
	      P_Ad_U_id    In	NUMBER,
	      P_Ad_Date    In	Date  ) IS
	 V_APPRV_MTHD_TYP  GNR_DDC_UNT.APPRV_MTHD_TYP%TYPE ;
	  V_JV_TYP NUMBER :=P_JV_TYP;
       BEGIN
	      DEL_APPRVD_LVL (P_DOC_TYP, P_DOC_SER);
	       IF V_JV_TYP=0 THEN
						       V_JV_TYP :=NULL;
						   END IF;
	      BEGIN
		  SELECT APPRV_MTHD_TYP
		   INTO V_APPRV_MTHD_TYP
		  FROM	GNR_DDC_UNT
		    WHERE DOC_TYP = P_DOC_TYP ;
	      EXCEPTION
		WHEN OTHERS THEN
		  V_APPRV_MTHD_TYP := 1 ;
	      END ;

	      BEGIN
		     INSERT   INTO S_APPRVD_MOV
				   (LVL_NO,
				    DOC_TYP,
				    DOC_SER,
				    DOC_NO,
				    DOC_JV_TYP,
				    DOC_DATE,
				    APPRVD,
				    ORDR_NO,
				    CMP_NO,
				    BRN_NO,
				    BRN_YEAR,
				    BRN_USR,
				    AD_U_ID,
				    AD_DATE)
			    SELECT DISTINCT LVL_NO,
					  DOC_TYP,
					  P_DOC_SER,
					  P_DOC_NO,
					  V_JV_TYP,
					  P_DOC_DATE,
					  1,
					  ORDR_NO,
					  P_CMP_NO,
					  P_BRN_NO,
					  P_BRN_YEAR,
					  P_BRN_USR,
					  P_AD_U_ID,
					  P_AD_DATE
			    FROM	  S_APPRVD_LVL
			    WHERE  DOC_TYP	   = P_DOC_TYP
			     AND   NVL(TYP_NO,0)   = CASE WHEN V_APPRV_MTHD_TYP IN (2,4) THEN V_JV_TYP ELSE NVL(TYP_NO,0) END
			     AND   NVL(BRN_NO,0)   = CASE WHEN V_APPRV_MTHD_TYP IN (3,4) THEN P_BRN_NO ELSE NVL(BRN_NO,0) END  ;
	       If Sql%NotFound Then
      						INSERT	 INTO S_APPRVD_MOV
				   (LVL_NO,DOC_TYP,
				    DOC_SER,DOC_NO,
				    DOC_JV_TYP,DOC_DATE,
				    APPRVD,ORDR_NO,CMP_NO,
				    BRN_NO,BRN_YEAR,BRN_USR,AD_U_ID,AD_DATE)
			    SELECT DISTINCT LVL_NO,DOC_TYP,P_DOC_SER,
					  P_DOC_NO,V_JV_TYP,P_DOC_DATE,1,
					  ORDR_NO,P_CMP_NO,P_BRN_NO,P_BRN_YEAR,
					  P_BRN_USR,P_AD_U_ID,P_AD_DATE
			    FROM	  S_APPRVD_LVL
			    WHERE  DOC_TYP	   = P_DOC_TYP;
    					End If;
    EXCEPTION
		     WHEN OTHERS THEN
		       RAISE_APPLICATION_ERROR (-20002, 'Err When Insert Into S_Apprvd_Mov = ' || SQLERRM);
	      END;
       END INSRT_AUTO_APPRVD_LVL;
--##-----------------------------------------------------------------------------##--
       PROCEDURE INSRT_AUTO_RJCT_APPRVD_LVL (
	      P_DOC_TYP    IN	NUMBER,
	      P_DOC_SER    IN	NUMBER,
	      P_DOC_NO	   IN	NUMBER,
	      P_JV_TYP	   IN	NUMBER DEFAULT 0,
	      P_DOC_DATE   IN	DATE,
	      P_CMP_NO	   IN	NUMBER,
	      P_BRN_NO	   IN	NUMBER,
	      P_BRN_YEAR   IN	NUMBER,
	      P_BRN_USR    IN	NUMBER,
	      P_Ad_U_id    In	NUMBER,
	      P_Ad_Date    In	Date  ) IS
	 V_APPRV_MTHD_TYP  GNR_DDC_UNT.APPRV_MTHD_TYP%TYPE ;
	  V_JV_TYP NUMBER :=P_JV_TYP;
       BEGIN
	      DEL_APPRVD_LVL (P_DOC_TYP, P_DOC_SER);
							IF V_JV_TYP=0 THEN
						       V_JV_TYP :=NULL;
						   END IF;
	      BEGIN
		  SELECT APPRV_MTHD_TYP
		   INTO V_APPRV_MTHD_TYP
		  FROM	GNR_DDC_UNT
		    WHERE DOC_TYP = P_DOC_TYP ;
	      EXCEPTION
		WHEN OTHERS THEN
		  V_APPRV_MTHD_TYP := 1 ;
	      END ;

	      BEGIN
		     INSERT   INTO S_APPRVD_MOV
				   (LVL_NO,
				    DOC_TYP,
				    DOC_SER,
				    DOC_NO,
				    DOC_JV_TYP,
				    DOC_DATE,
				    APPRVD,
				    ORDR_NO,
				    CMP_NO,
				    BRN_NO,
				    BRN_YEAR,
				    BRN_USR,
				    AD_U_ID,
				    AD_DATE)
			    SELECT  DISTINCT LVL_NO,
				    DOC_TYP,
				    P_DOC_SER,
				    P_DOC_NO,
				    V_JV_TYP,
				    P_DOC_DATE,
				    2,
				    ORDR_NO,
				    P_CMP_NO,
				    P_BRN_NO,
				    P_BRN_YEAR,
				    P_BRN_USR,
				    P_AD_U_ID,
				    P_AD_DATE
			    FROM    S_APPRVD_LVL
			    WHERE  DOC_TYP	   = P_DOC_TYP
			     AND   NVL(TYP_NO,0)   = CASE WHEN V_APPRV_MTHD_TYP IN (2,4) THEN V_JV_TYP ELSE NVL(TYP_NO,0) END
			     AND   NVL(BRN_NO,0)   = CASE WHEN V_APPRV_MTHD_TYP IN (3,4) THEN P_BRN_NO ELSE NVL(BRN_NO,0) END  ;
		If Sql%NotFound Then
		 INSERT   INTO S_APPRVD_MOV
				   (LVL_NO,
				    DOC_TYP,
				    DOC_SER,
				    DOC_NO,
				    DOC_JV_TYP,
				    DOC_DATE,
				    APPRVD,
				    ORDR_NO,
				    CMP_NO,
				    BRN_NO,
				    BRN_YEAR,
				    BRN_USR,
				    AD_U_ID,
				    AD_DATE)
			    SELECT DISTINCT  LVL_NO,
				    DOC_TYP,
				    P_DOC_SER,
				    P_DOC_NO,
				    V_JV_TYP,
				    P_DOC_DATE,
				    2,
				    ORDR_NO,
				    P_CMP_NO,
				    P_BRN_NO,
				    P_BRN_YEAR,
				    P_BRN_USR,
				    P_AD_U_ID,
				    P_AD_DATE
			    FROM    S_APPRVD_LVL
			    WHERE  DOC_TYP	   = P_DOC_TYP;
		  End If;

		EXCEPTION
		     WHEN OTHERS THEN
			    RAISE_APPLICATION_ERROR (-20002, 'Err When Insert Into S_Apprvd_Mov = ' || SQLERRM);
	      END;
END INSRT_AUTO_RJCT_APPRVD_LVL;
--##-----------------------------------------------------------------------------##--
Procedure Auto_Apprvl_Lvl_Prc(	P_Doc_Typ	In Number,
				P_Doc_Srl	In Number,
				P_Tbl_Nm	In Varchar2  Default Null,
				P_Srl_Fld_Nm	In Varchar2  Default Null,
				P_Ad_U_Id	In Number)IS
    V_Cnt	   Number:=0;
    V_Cnt2	   Number:=0;
    V_APPROVED	   Number:=5;
    V_Row_Updt	   Number:=0;
    V_Tbl_Nm	   Varchar2(100):=P_Tbl_Nm;
    V_Srl_Fld_Nm   Varchar2(100):=P_Srl_Fld_Nm;
BEGIN

    IF P_Tbl_Nm Is Null Or P_Srl_Fld_Nm Is Null Then
	Begin
	    Select TBL_MST_NM, TBL_DOCSRL_NM
		Into V_Tbl_Nm, V_Srl_Fld_Nm
		From GNR_DDC_TBL
	       Where DOC_TYP = P_Doc_Typ
		 And Rownum<=1;
	Exception When Others Then
	     Return;
	End;
    End If;
    Begin
	    EXECUTE IMMEDIATE ' SELECT APPROVED FROM ' || V_TBL_NM ||
			      ' WHERE ' || V_Srl_Fld_Nm || ' = ' || P_Doc_Srl Into V_APPROVED ;
    Exception When Others Then
       Return;
    End;
    Begin
	    For I In (Select Mov.Lvl_No From S_Apprvd_Lvl Lvl, S_Apprvd_Mov Mov Where Lvl.Doc_Typ = Mov.Doc_Typ
										  And Lvl.Lvl_No  = Mov.Lvl_No
										  And Nvl(Lvl.Auto_Apprvl,0)=1
										  And Lvl.Doc_Typ = P_Doc_Typ
										  And Mov.Doc_Ser = P_Doc_Srl
										  And Nvl(Mov.Apprvd,0)=0 )
	    Loop
		Begin
		    Update S_Apprvd_Mov
		       Set Apprvd      =  1,
			   Apprvd_U_Id = P_Ad_U_Id,
			   Apprvd_Date = Ys_Gen_Pkg.Get_Curdate,
			   Apprvd_Desc = Ys_Gen_Pkg.Get_Prompt(Ias_Prmtr_Pkg.Getpval(P_Prmtr =>'LANG_NO'),17510)
		     Where Doc_Ser = P_Doc_Srl
		       And Lvl_No  = I.Lvl_No;
	
		       V_Row_Updt:=1;
		Exception When Others Then
		     Return;
		End;
	    End loop;
    Exception When Others Then
	Return;
    End;
    IF V_Row_Updt = 1 Then
	Begin

		Select Count(1) Into V_Cnt
		    From S_Apprvd_Mov
		   Where DOC_TYP = P_Doc_Typ
		     And Doc_Ser = P_Doc_Srl
		     And Nvl(Apprvd,0)=1;

		Select Count(1) Into V_Cnt2
		    From S_Apprvd_Lvl
		   Where DOC_TYP = P_Doc_Typ;



	    IF V_Cnt = V_Cnt2 Then

		EXECUTE IMMEDIATE ' UPDATE ' || V_TBL_NM ||
				  '    SET APPROVED = ' || 1 ||-- Approved
				  '	 , APRV_U_ID = ' || P_Ad_U_Id ||
				  '	 , APRV_DATE = YS_GEN_PKG.GET_CURDATE' ||
				  '	 , APRV_DSC = Ys_Gen_Pkg.Get_Prompt(Ias_Prmtr_Pkg.Getpval(P_Prmtr =>''LANG_NO''),17510)' ||
				  ' WHERE ' || V_Srl_Fld_Nm || ' = ' || P_Doc_Srl;
	    ElsIF V_Cnt < V_Cnt2 Then

		EXECUTE IMMEDIATE ' UPDATE ' || V_TBL_NM ||
				  '    SET APPROVED = ' || 3 || -- In Progress
				  '	 , APRV_U_ID = ' || P_Ad_U_Id ||
				  '	 , APRV_DATE = YS_GEN_PKG.GET_CURDATE' ||
				  '	 , APRV_DSC = Ys_Gen_Pkg.Get_Prompt(Ias_Prmtr_Pkg.Getpval(P_Prmtr =>''LANG_NO''),17510)' ||
				  ' WHERE ' || V_Srl_Fld_Nm || ' = ' || P_Doc_Srl;

	    End IF;

	Exception When Others Then
	    Raise_Application_Error(-20002,'Err In Auto_Apprvl_Lvl_Prc, '||Sqlerrm);
	End;
    End IF;
END Auto_Apprvl_Lvl_Prc;
--##-----------------------------------------------------------------------------##--
FUNCTION  Get_Usr_Apprv ( P_Usr_No In Number ,
			  P_Doc_Typ In Number,
			  P_Typ_NO In Number Default Null,
			  P_Doc_Amt In Number Default Null
			 )  Return Number Is
V_Appr	   Number:=0;
V_DOC_AMT  Number;
V_CNT	   NUMBER;
BEGIN
    IF	 NVL(P_Doc_Amt,0)>0  THEN

	BEGIN
	       Select 1 INTO V_CNT
	       From S_V_Apprvd_Usr
	      Where Doc_Typ= P_Doc_Typ
		AND NVL(TYP_NO,0)=DECODE(NVL(TYP_NO,0),0,0,DECODE(NVL(P_Typ_NO,0),0,NVL(TYP_NO,0),P_Typ_NO))
		And U_Id=P_Usr_No
		And NVL(T_Amt,0) > 0
		And Prv_Flg=1
		And Rownum<=1;
	EXCEPTION WHEN OTHERS THEN
	   V_CNT:=0;
	END;

	IF NVL(V_CNT,0)=1 THEN
	     V_DOC_AMT:=P_Doc_Amt	 ;
	ELSE
	     V_DOC_AMT:=NULL	    ;
	END IF;
    END IF ;

     If V_DOC_AMT Is Null Then
	 Select 1
	   Into V_Appr
	   From S_V_Apprvd_Usr
	  Where Doc_Typ=P_Doc_Typ
	    AND NVL(TYP_NO,0)=DECODE(NVL(TYP_NO,0),0,0,DECODE(NVL(P_Typ_NO,0),0,NVL(TYP_NO,0),P_Typ_NO))
	    And U_Id=P_Usr_No
	    And Prv_Flg=1
	    And Rownum<=1;
     Else
	 Select 1
	   Into V_Appr
	   From S_V_Apprvd_Usr
	  Where Doc_Typ=P_Doc_Typ
	    AND NVL(TYP_NO,0)=DECODE(NVL(TYP_NO,0),0,0,DECODE(NVL(P_Typ_NO,0),0,NVL(TYP_NO,0),P_Typ_NO))
	    And U_Id=P_Usr_No
	    And Nvl(V_DOC_AMT,0) Between NVL(F_Amt,0) And NVL(T_Amt,Nvl(V_DOC_AMT,0))
	    And NVL(T_Amt,0) > 0
	    And Prv_Flg=1
	    And Rownum<=1;
     End If ;
   Return(V_Appr);
 EXCEPTION
  When Others Then
   Return(0);
END Get_Usr_Apprv;
--##-----------------------------------------------------------------------------##--				
End YS_APPRVD_PKG;
/

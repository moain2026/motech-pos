-- TYPE: DOC_SYS_ID_TYP (status: VALID)
CREATE OR REPLACE
TYPE	       "DOC_SYS_ID_TYP" 					 AS OBJECT ( DOC_TYPE NUMBER(5),
																								  SYS_NO   NUMBER(5),
																								  CMP_NO   NUMBER(3),
																								  DOC_SRL NUMBER,
																								  DOC_SQ_M NUMBER,
																								  IDNTFR_CLMN_NM VARCHAR2 (30),
																								  TBL_NM VARCHAR2 (30),
																								  TBL_UPD_WHR VARCHAR2 (255),
																								  UPD_OP_TYP NUMBER (1))
/

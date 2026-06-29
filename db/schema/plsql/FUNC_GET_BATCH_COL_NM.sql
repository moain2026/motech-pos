-- FUNCTION: GET_BATCH_COL_NM (status: INVALID)
CREATE OR REPLACE
FUNCTION Get_Batch_Col_Nm (P_Col_No In Number, P_Col_Val Varchar2,P_Lang_No Number default 1) return VARCHAR2 Is
   V_Nm varchar2(100);
 Begin
     select Decode(P_Lang_No,1,Nvl(BATCH_DESC_A_NAME,BATCH_DESC_E_NAME),Nvl(BATCH_DESC_E_NAME,BATCH_DESC_A_NAME)) BATCH_NAME
       Into V_Nm
       From IAS_BATCH_NO_CONTENTS
      where COL_NO=p_col_no
	and BATCH_desc_no=p_col_val;
	NULL;
     Return(V_Nm);
 Exception
    when others then
      Return(p_col_val);
 End Get_Batch_Col_Nm;
/

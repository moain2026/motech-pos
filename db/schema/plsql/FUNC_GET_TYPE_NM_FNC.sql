-- FUNCTION: GET_TYPE_NM_FNC (status: INVALID)
CREATE OR REPLACE
FUNCTION Get_Type_Nm_Fnc( P_lang_no   In NUMBER,
					    P_doctype	In NUMBER,
					    P_jvtype	In NUMBER Default Null) RETURN CHAR Is
v_jvname VARCHAR2(100);
BEGIN
If P_doctype = 42 Then
   Select Decode(P_Lang_no,1,PO_A_NAME,nvl(PO_E_NAME,PO_A_NAME))
     Into v_jvname From IAS_PORDER_TYPES
    Where PO_TYPE = P_jvtype
      and RowNum<=1;
Else
  Return(P_jvtype);
End If;

 Return(v_jvname);
Exception
 When Others Then
   Return(P_jvtype);
END Get_Type_Nm_Fnc;
/

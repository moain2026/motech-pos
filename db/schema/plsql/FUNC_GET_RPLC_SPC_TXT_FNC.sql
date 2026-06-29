-- FUNCTION: GET_RPLC_SPC_TXT_FNC (status: VALID)
CREATE OR REPLACE
FUNCTION Get_Rplc_Spc_Txt_Fnc ( P_Src_Str IN   VARCHAR2 ) RETURN VARCHAR2 IS
						BEGIN
						    RETURN(Regexp_Replace( P_Src_Str,'[[:space:]]{2,}|[[:cntrl:]]',' '));
						EXCEPTION WHEN OTHERS THEN
						    RETURN P_Src_Str;
						END Get_Rplc_Spc_Txt_Fnc;
/

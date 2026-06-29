-- FUNCTION: IAS_CHK_BRN_UP_DEL_FNC (status: VALID)
CREATE OR REPLACE
FUNCTION Ias_Chk_Brn_Up_Del_Fnc (
																				P_Brn_Scr   In Number ,
																				P_Brn_Data  In Number ,
																				P_Trns_Type In Number ) RETURN NUMBER IS
				BEGIN
				   If P_Brn_Scr = P_Brn_Data Then --P_Trns_Type (1-Update , 2-Delete)
				     Return(0);
				   Else
				     Return(1);
				   End If;
				EXCEPTION WHEN OTHERS THEN
				       Return(0);
				END Ias_Chk_Brn_Up_Del_Fnc;
/

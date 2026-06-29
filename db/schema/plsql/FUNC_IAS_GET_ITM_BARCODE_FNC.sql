-- FUNCTION: IAS_GET_ITM_BARCODE_FNC (status: INVALID)
CREATE OR REPLACE
FUNCTION Ias_Get_Itm_Barcode_Fnc ( P_Barcode_Type Number , P_Icode Varchar2 , P_Barcode Varchar2) RETURN Varchar2 IS
				  V_Barcode  Ias_Itm_Unt_Barcode.Barcode%Type;
				  V_Icode    Ias_Itm_Unt_Barcode.I_Code%Type;
				BEGIN
				   -----------------------------------------------------------------------------------------------------
				   If P_Barcode_Type=1 Then --	Barcode Same Item
				     V_Icode := P_Icode;
				   End If;
				   -----------------------------------------------------------------------------------------------------
				   If V_Icode Is Not Null Then
				       If P_Barcode_Type=1 And Nvl(P_Barcode,'0')<>'0' Then
					  V_Barcode := P_Barcode ;
				       Else
					  Begin
					    Select Barcode InTo V_Barcode From Ias_Itm_Unt_Barcode Where I_Code=V_Icode And RowNum<=1;
					  Exception When Others Then
					    V_Barcode := Null;
					  End;
				       End If;
				   End If;
				   -----------------------------------------------------------------------------------------------------
				   Return(V_Barcode);
				   -----------------------------------------------------------------------------------------------------
				EXCEPTION
				   WHEN OTHERS THEN
				       Return(Null);
				END Ias_Get_Itm_Barcode_Fnc;
/

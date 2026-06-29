-- PROCEDURE: IAS_GET_QUT_PRM_PRICE_PRC (status: INVALID)
CREATE OR REPLACE
PROCEDURE Ias_Get_Qut_Prm_Price_Prc ( P_Date   In  Date,
																		   P_ICode  In	Varchar2,
																		   P_Rate   In	Number,
																		   P_Nof    In	Number,
																		   P_Q_No   Out Number,
																		   P_Price  Out Number)   IS
				    Q_Cur Varchar2(9);
				    Rate  Number;
				    Prc   Number;
				BEGIN
				
				    Select Ias_Qut_Prm_Mst.Quot_No,Ias_Qut_Prm_Dtl.I_Price InTo P_Q_No,P_Price
				      From Ias_Qut_Prm_Mst,Ias_Qut_Prm_Dtl
				     Where Ias_Qut_Prm_Mst.Quot_No = Ias_Qut_Prm_Dtl.Quot_No
				       And Nvl(Ias_Qut_Prm_Mst.Inactive,0)=0
				       And P_date Between F_Date And T_Date
				       And To_Char(To_Date(P_date),'D') In (Fld_Day1,Fld_Day2,Fld_Day3,Fld_Day4,Fld_Day5,Fld_Day6,Fld_Day7)
				       And To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') Between Nvl(F_Time,To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS')) And Nvl(T_Time,To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS'))
				       And I_Code = P_ICode
				       And RowNum <=1 ;
				
				     If P_Q_No Is Not Null Then
				
					 Select Quot_Cur InTo Q_Cur
					   From Ias_Qut_Prm_Mst
					  Where Quot_No = P_Q_No
					    And RowNum <=1 ;
				
					Rate := Ias_Gen_Pkg.Get_Cur_rate(Q_cur);
					P_Price := (Nvl(P_Price,0) * Nvl(round((Rate/P_Rate),P_Nof),0));
				     End If;
				
				   EXCEPTION
				     WHEN NO_DATA_FOUND THEN
				       NULL;
				     WHEN OTHERS THEN
				       NULL; --RAISE;
				   END Ias_Get_Qut_Prm_Price_Prc;
/

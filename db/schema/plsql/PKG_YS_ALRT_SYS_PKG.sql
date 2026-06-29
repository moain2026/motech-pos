-- =============================================
-- PACKAGE SPEC: YS_ALRT_SYS_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
Package Ys_Alrt_Sys_Pkg As
--##--------------------------------------------------------------------------------------##--
  Procedure Chk_Alrt_Prc ( P_Usr_No   In User_R.U_Id%Type      ,
			   P_Lng_No   In Pls_Integer Default 1 ,
			   P_Sys_No   In Number Default Null,
			   P_SHW_ALRT_AFTR_LGN Number Default 0,
			   P_SHW_ALRT_IN_SCR Number Default 0  );
--##--------------------------------------------------------------------------------------##--
  Function  Get_Alrt_Usr_Hide_Date(P_Alrt_No   In S_Alrt_Sys_Mst.Alrt_No%Type	,
				   P_Usr_No    In User_R.U_Id%Type		) Return Date ;
--##--------------------------------------------------------------------------------------##--
End Ys_Alrt_Sys_Pkg ;
/

-- ---------------------------------------------
-- PACKAGE BODY: YS_ALRT_SYS_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
Package Body Ys_Alrt_Sys_Pkg As
--##--------------------------------------------------------------------------------------##--
 Procedure Chk_Alrt_Prc ( P_Usr_No   In User_R.U_Id%Type      ,
			   P_Lng_No   In Pls_Integer Default 1 ,
			   P_Sys_No   In Number Default Null,
			   P_SHW_ALRT_AFTR_LGN Number Default 0,
			   P_SHW_ALRT_IN_SCR Number Default 0  ) Is
      Cursor Alrt_Cv Is
	 Select M.Alrt_No,M.Lbl_No,M.Msg_No,M.SYS_NO,M.Ordr_No,M.Alrt_Day Alrt_Day,
		M.Alrt_Slct,M.Alrt_Slct_Whr,M.Alrt_Slct_Ordr,M.Alrt_Grp_By,
		M.Alrt_Actn, M.Alrt_Prd_Typ ,M.Alrt_Hide ,M.Alrt_Hide_Whr,M.RPRT_NM ,M.FORM_NO
	  From S_Alrt_Sys_Mst M
	    Where ( M.Alrt_Day Is Not Null Or Alrt_Actn <> 1)
	      And     Nvl(M.Inactive,0) = 0
	      And     Nvl(M.SHW_ALRT_AFTR_LGN,0) = Decode(P_SHW_ALRT_AFTR_LGN,1,P_SHW_ALRT_AFTR_LGN, Nvl(M.SHW_ALRT_AFTR_LGN,0))
	      And     Nvl(M.SHW_ALRT_IN_SCR,0) = Decode(P_SHW_ALRT_IN_SCR,1,P_SHW_ALRT_IN_SCR, Nvl(M.SHW_ALRT_IN_SCR,0))
	      And     Nvl(M.Alrt_St,0)	= 1
	      --And	M.Lbl_No Is Not Null
	      And     M.Alrt_Slct Is Not Null
	      And     Nvl(M.Sys_No,0) =80 --Decode (P_Sys_No ,Null ,Nvl(M.Sys_No,0),P_Sys_No)
	      And (P_Usr_No = 1 Or Exists (Select 1 From S_Usr_Alrt_Sys_Priv
							     Where Alrt_No = M.Alrt_No
							       And   U_Id     = P_Usr_No
							       And   Prv_Flg = 1
							       And Rownum<=1  ))
	    Order By M.Ordr_No , M.Alrt_No ;

	   V_Cnt       Number;
	   V_Slct      Varchar2(32000);
	   V_Slct_Whr  Varchar2(10000);
	   V_Date_Whr  Date ;
	  Begin

	    Delete From S_Alrt_Data_Tmp Where U_Id = P_Usr_No;

	    For I In Alrt_Cv Loop
	     If I.Alrt_No=804 And Ias_gen_pkg.Get_Frm_Prv(P_UserNo =>P_Usr_No,P_Frm_no=>923)=0 and Ias_gen_pkg.Get_Frm_Prv(P_UserNo =>P_Usr_No,P_Frm_no=>939)=0 Then
		NULL;
	     ElsIf I.Alrt_No=805 And Ias_gen_pkg.Get_Frm_Prv(P_UserNo =>P_Usr_No,P_Frm_no=>924)=0 and Ias_gen_pkg.Get_Frm_Prv(P_UserNo =>P_Usr_No,P_Frm_no=>939)=0 Then
		NULL;
	     ElsIf I.Alrt_No=806 And Ias_gen_pkg.Get_Frm_Prv(P_UserNo =>P_Usr_No,P_Frm_no=>924)=0  Then
		NULL;
	     Else
		 If I.Alrt_Actn = 1 Then -- By Period
		    V_Slct := I.Alrt_Slct||' '||I.Alrt_Slct_Whr||' '||I.Alrt_Day;
		    V_Slct_Whr:=I.Alrt_Slct_Whr||' '||I.Alrt_Day||' '||I.Alrt_Grp_By;
		 Else
		    V_Slct := I.Alrt_Slct||' '||I.Alrt_Slct_Whr;
		    V_Slct_Whr:=I.Alrt_Slct_Whr||' '||I.Alrt_Grp_By;
		 End If;

	       If Nvl(I.Alrt_Hide,0) = 1 Then
		Begin
		      V_Date_Whr := Ys_Alrt_Sys_Pkg.Get_Alrt_Usr_Hide_Date (   P_Alrt_No   => I.Alrt_No ,
									       P_Usr_No    => P_Usr_No ) ;
		Exception
		 When Others Then
			 Null;
		End ;

	       End If ;
		 V_Slct:=Replace (Upper(V_Slct),'V_USR_NO',P_Usr_No);
		 V_Slct:=Replace (Upper(V_Slct),'V_LNG_NO',P_Lng_No);

		 V_Slct_Whr:=Replace (Upper(V_Slct_Whr),'V_USR_NO',P_Usr_No);
		 V_Slct_Whr:=Replace (Upper(V_Slct_Whr),'V_LNG_NO',P_Lng_No);

		 Begin
		  If  Nvl(I.Alrt_Hide,0) = 1 And I.Alrt_Hide_Whr  Is Not Null And V_Date_Whr Is Not Null Then
		      Execute Immediate V_Slct ||' '|| I.Alrt_Hide_Whr ||'  '||'To_Date('||''''||V_Date_Whr||''''||',''DD/MM/YYYY'')'  Into V_Cnt;
		 Else
		     Execute Immediate V_Slct  Into V_Cnt;
		End If ;
		   Exception When Others Then
		    V_Cnt := 0;
		 End;

		    If Nvl(V_Cnt,0) > 0 Then
			 Begin
				 Insert Into S_Alrt_Data_Tmp ( Alrt_No		  ,
							       Msg_No		  ,
							       Lbl_No		  ,
							       U_Id		  ,
							       SYS_NO						  ,
							       Ordr_No		  ,
							       Alrt_Day 	  ,
							       Alrt_Prd_Typ	  ,
							       Alrt_Slct_Whr	  ,
							       Alrt_Slct_Ordr	  ,
							       Alrt_Cnt 	  ,
							       Alrt_Hide	  ,
							       Alrt_Hide_Whr		  ,
							       RPRT_NM,
							       FORM_NO)
						      Values ( I.Alrt_No	  ,
							       I.Msg_No 	  ,
							       I.Lbl_No 	  ,
							       P_Usr_No 	  ,
							       I.SYS_NO						,
							       I.Ordr_No	  ,
							       I.Alrt_Day	  ,
							       I.Alrt_Prd_Typ	  ,
							       V_Slct_Whr	  ,
							       I.Alrt_Slct_Ordr   ,
							       V_Cnt		  ,
							       I.Alrt_Hide			  ,
							       I.Alrt_Hide_Whr		,
							       I.RPRT_NM,
							       I.FORM_NO );
			     Commit;
			  Exception
			   When Others Then
			       Raise_Application_Error (-20001,'Err. In Insrt Tmp Table '||SqlErrm);
			 End;
		   End If;
	       End If;
	    End Loop;
    Exception
     When Others Then
	Raise_Application_Error (-20001,'Err.Last  In Insrt Tmp Table '||SqlErrm);
   End Chk_Alrt_Prc;
--##--------------------------------------------------------------------------------------##--
Function  Get_Alrt_Usr_Hide_Date (   P_Alrt_No	 In S_Alrt_Sys_Mst.Alrt_No%Type   ,
						      P_Usr_No In User_R.U_Id%Type		       ) Return Date Is
  V_Nt_Dis_Date Date ;
Begin
   /* Select MAX(Nt_Dis_Date) Into V_Nt_Dis_Date
       From Ias_Trace_Lgn_Note
	Where Nt_No	     =	 P_Alrt_No
	  And	Nt_Dis_U_Id  =	P_Usr_No;
      Return(TO_Date(V_Nt_Dis_Date,'DD/MM/YYYY'));*/
      Return(TO_Date(Ias_gen_Pkg.Get_Frst_Day,'DD/MM/YYYY'));
Exception
 When Others Then
   Return(TO_Date(Ias_gen_Pkg.Get_Frst_Day,'DD/MM/YYYY'));
End Get_Alrt_Usr_Hide_Date ;
--##--------------------------------------------------------------------------------------##--
End Ys_Alrt_Sys_Pkg;
/

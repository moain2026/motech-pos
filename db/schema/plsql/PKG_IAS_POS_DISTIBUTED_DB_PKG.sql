-- =============================================
-- PACKAGE SPEC: IAS_POS_DISTIBUTED_DB_PKG  (status: VALID)
-- =============================================
CREATE OR REPLACE
Package  Ias_Pos_Distibuted_Db_Pkg As
    Function Get_Date (Sqlstr Varchar2)  Return Date ;
    Procedure Get_Chr_Tow_Value (Sqlstr In  Varchar2 ,
				 V_Chr	Out Varchar2 ,
				 V_Val1 Out Number   ,
				 V_Val2 Out Number   );

    Procedure Get_Chr_Bill_Value (Sqlstr In  Varchar2 ,
				 V_Chr	Out Varchar2 ,
				 V_Val1 Out Number   ,
				 V_Val2 Out Number   ,
				 V_Val3 Out Number   ,
				 V_Val4 Out Number   ,
				 V_Val5 Out Number);

    Procedure Update_Card_In_Db_Link (P_Card_No In Varchar2 ,
				      P_Db_Link In Varchar2 );

    Procedure Update_RtBill_Payed_In_Db_Link ( P_Table_Nm   In Varchar2 ,
					       P_Bill_No    In Number	,
					       P_Rt_Bill_No In Number	,
					       P_Db_Link    In Varchar2 ,
					       P_Machine_No In Number	,
					       P_Usr_No     In Number	) ;
		Procedure Get_PayCash_RtBillNo_Info ( P_Sqlstr	     In     Varchar2,
									P_Rt_Bill_No	     In     Number  ,
									P_Rt_Bill_Date	     In Out Date    ,
									P_Return_Type	     In Out Number  ,
									P_A_Cy		     In Out Varchar2,
									P_Rt_Bill_Rate	     In Out Number  ,
									P_Rt_Bill_Amt	     In Out Number  ,
									P_Disc_Amt	     In Out Number  ,
									P_Vat_Amt	     In Out Number  ,
									P_Cheque_Amt	     In Out Number  ,
									P_Machine_No	     In Out Number  ,
									P_Ad_U_Id	     In Out Number  ,
									P_Ad_Date	     In Out Date    ,
									P_Machine_No_Rt_Bill In Out Number  ,
									P_Bill_No	     In Out Number  ,
									P_QT_CPN_RPLC_AMT    In Out Number  ) ;
		Procedure Get_PayCash_BillNo_Info ( P_Sqlstr	   In	  Varchar2,
						    P_Bill_No	   In	  Number  ,
						    P_Bill_Date    In Out Date	  ,
						    P_Ad_U_Id	   In Out Number  ,
						    P_Ad_Date	   In Out Date	  ,
						    P_Machine_No   In Out Number  ,
						    P_Brn_No	   In Out Number);

		Procedure Get_Price_From_Bill ( P_Sqlstr       In   Varchar2	 ,
						P_Bill_No      In   Number	 ,
						P_I_Code       In   Varchar2	 ,
						P_P_Qty        In Out	  Number ,
						P_I_Qty        In Out	  Number ,
				    P_Free_Qty	   In Out     Number ,
						P_I_Price      In Out	  Number ,
				    P_I_Price_Vat  In Out     Number ,
						P_Dis_Amt_Mst  In Out	  Number ,
						P_Dis_Amt_Mst_Vat In Out  Number ,
						P_Dis_Amt_Dtl  In Out	  Number ,
				    P_Vat_Per	   In Out     Number ,
						P_Vat_Amt      In Out	  Number ,
						P_Dis_Amt_Dtl_Vat In Out Number,
				    P_Dis_Aftr_Vat_Mst In Out Number,
				    P_Qr_Code	       In Out Varchar2,
				    P_Emp_No	       In Out Number,
				    P_Itm_Unt	       In Out Varchar2);

Procedure Get_Data_From_Bill_Mst ( P_Sqlstr	   In	Varchar2     ,
					   P_Bill_No	   In	Number	     ,
				   P_cust_code	     In Out	Number ,
					       P_Mobile_No	 In Out     Number ,
					       P_Point_Typ_No	 In Out     Number ,
					       P_CRD_DISC_PER	 In Out     Number ,
					       P_Disc_Amt_Hl_Prm In Out     Number ,
					       P_Bill_Date	 In Out     Date   ,
					       P_Emp_no 	 In Out     Number ,
					       P_Bill_Rtrn	 In Out     Number ,
					       P_Clc_Typ_No_Tax  In Out     Number ,
					       P_Qt_Cpn_Amt	 In Out     Number ,
					       P_Card_Amt	 In Out     Number ,
					       P_Card_Amt_Free	 In Out     Number ,
					       P_Net_Amt_Bill	 In Out     Number ,
					       P_PYMNT_AC	 In Out     Number,
			     P_AC_CODE	       In Out	  Varchar2,
			     P_AC_CODE_DTL     In Out	  Varchar2,
			     P_AC_DTL_TYP      In Out	  Number,
			     P_AC_AMT	       In Out	  Number );

PROCEDURE UPDATE_POS_SERVER_DB_LINK ( P_DB_LINK IN VARCHAR2 );
PROCEDURE EXECUTE_SQL_PRC(Sqlstr Varchar2) ;
End Ias_Pos_Distibuted_Db_Pkg ;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_POS_DISTIBUTED_DB_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
Package Body Ias_Pos_Distibuted_Db_Pkg As
    Function Get_Date (Sqlstr Varchar2)  Return Date Is
     Val Date;
    Begin
	Execute Immediate Sqlstr Into Val;
	 Return Val;
     Exception
      When No_Data_Found Then
       Return Null ;
      When Others Then
       Raise_Application_Error(-20001,'Error  Get_Date ' || '' || Sqlerrm);
    End Get_Date ;
--##----------------------------------------------------------------------------------------------##--
    Procedure Get_Chr_Tow_Value (Sqlstr In  Varchar2  ,
				 V_Chr	Out Varchar2  ,
				 V_Val1 Out Number    ,
				 V_Val2 Out Number    )  Is
    Begin
	Execute Immediate Sqlstr Into V_Chr,V_Val1,V_Val2 ;
     Exception
      When No_Data_Found Then
       Null ;
      When Others Then
       Raise_Application_Error(-20002,'Error  Get_Chr_Tow_Value ' || '' || Sqlerrm);
    End Get_Chr_Tow_Value ;
--##----------------------------------------------------------------------------------------------##--
    Procedure Get_Chr_Bill_Value (Sqlstr In  Varchar2  ,
				  V_Chr  Out Varchar2  ,
				  V_Val1 Out Number    ,
				  V_Val2 Out Number    ,
				  V_Val3 Out Number    ,
				  V_Val4 Out Number    ,
				  V_Val5 Out Number)  Is
    Begin
	Execute Immediate Sqlstr Into V_Chr,V_Val1,V_Val2,V_Val3,V_Val4,V_Val5 ;
     Exception
      When No_Data_Found Then
       Null ;
      When Others Then
       Raise_Application_Error(-20002,'Error  Get_Chr_Bill_Value ' || '' || Sqlerrm);
    End Get_Chr_Bill_Value ;
--##----------------------------------------------------------------------------------------------##--
Procedure Update_Card_In_Db_Link (P_Card_No In Varchar2 ,
				  P_Db_Link In Varchar2 )  Is
   V_Use_Prev_Paid_Card  Number;
   V_Use_Card_More_One	 Number;
  begin
    Begin
     Select Use_Prev_Paid_Card,Use_Card_More_One
       Into V_Use_Prev_Paid_Card,V_Use_Card_More_One
	From Ias_Para_Pos;
    Exception When Others Then
      V_Use_Prev_Paid_Card:=0;
      V_Use_Card_More_One :=0;
    End;

    If Nvl(V_Use_Prev_Paid_Card,0)=1 Then
      If P_Card_No is null Then
		      Execute Immediate ' DELETE FROM IAS_POS_CUST_CARD_AMT_TMP  ';
		      Execute Immediate ' insert into Ias_Pos_Cust_Card_Amt_tmp
		      select card_no from
		     (select card_no,REM_CARD_AMT,PROCESSED From Ias_Pos_Customer_Card_Amount Where Nvl(Processed,0)=0
			    minus
		      select card_no,REM_CARD_AMT,PROCESSED From '||User||'.Ias_Pos_Customer_Card_Amount@'||P_Db_Link||')';		
		   Else
		      	Execute Immediate ' DELETE FROM IAS_POS_CUST_CARD_AMT_TMP ';
			Begin
			  Insert Into Ias_Pos_Cust_Card_Amt_Tmp Values(P_Card_No);
			Exception When Others Then
			  Raise_Application_Error(-2000,'Error	When Insert into card tmp table ' || '' || Sqlerrm);
			End;	
      End If;
      If Nvl(V_Use_Card_More_One,0) =1 Then
       Declare
	 Cursor C_Card Is Select Card_No,Rem_Card_Amt
	  From Ias_Pos_Customer_Card_Amount
	    Where  Exists(Select 1
					    From  Ias_Pos_Cust_Card_Amt_tmp
					     Where  Ias_Pos_Cust_Card_Amt_tmp.Card_No=Ias_Pos_Customer_Card_Amount.Card_No			
					      And RowNum       <= 1  )
	    Order By Card_No;
	  V_Rem_Amt_Srv Number;
	     Begin
	       For I In C_Card Loop
		    Begin
		      V_Rem_Amt_Srv :=IAS_Gen_Pkg.Get_Cnt ('select REM_CARD_AMT from
				  '||User||'.Ias_Pos_Customer_Card_Amount@'||P_Db_Link||'  Where Card_No ='''||I.Card_No||'''');
		     Exception
		      When Others Then
		      V_Rem_Amt_Srv:=0 ;
		    End;

		   If Nvl(I.Rem_Card_Amt,0)< Nvl(V_Rem_Amt_Srv,0) Then
			 Begin
				Execute Immediate ' Update '||User||'.Ias_Pos_Customer_Card_Amount@'||P_Db_Link||'
						  Set  Processed    =  1 ,
						  Rem_Card_Amt	    ='||Nvl(I.Rem_Card_Amt,0)||'
						   Where Card_No    ='''||I.Card_No||'''' ;
			 Exception
			  When Others Then
			   Null ;
			 End;
		   End If;
	       End Loop  ;
	     End;
      Else
	 If P_Card_No is null Then
	     Begin
		Execute Immediate ' Update '||User||'.Ias_Pos_Customer_Card_Amount@'||P_Db_Link||' a
				  Set  Processed    =  1 ,
				  Rem_Card_Amt	    = 0
				   Where   Exists(Select 1
						 From  Ias_Pos_Cust_Card_Amt_tmp
						   Where  Ias_Pos_Cust_Card_Amt_tmp.Card_No=a.Card_No			
						    And RowNum	     <= 1  )';
	     Exception
	      When Others Then
	       Null ;
	     End;
	 Else
	     Begin
		Execute Immediate ' Update '||User||'.Ias_Pos_Customer_Card_Amount@'||P_Db_Link||'
				  Set  Processed    =  1 ,
				  Rem_Card_Amt	    = 0
				   Where  CARD_NO= '''||P_Card_No||'''';
	     Exception
	      When Others Then
	       Null ;
	     End;

	 End If;
      End If;
    End If;
  Exception when others Then
     Raise_Application_Error(-20002,'Error  updatee ' || '' || Sqlerrm);
  End Update_Card_In_Db_Link ;
--##----------------------------------------------------------------------------------------------##--
    Procedure Update_RtBill_Payed_In_Db_Link ( P_Table_Nm   In Varchar2 ,
					       P_Bill_No    In Number	,
					       P_Rt_Bill_No In Number	,
					       P_Db_Link    In Varchar2 ,
					       P_Machine_No In Number	,
					       P_Usr_No     In Number	)  Is
    Begin
      Execute Immediate ' Update '||User||'.'||P_Table_Nm||'@'||P_Db_Link||'
			   Set Payed	       = 1			      ,
			   --  Bill_No	       = '||P_Bill_No ||'   ,
			       Machine_No_Paid = '||P_Machine_No||'	   ,
			       Paid_U_Id       = '||P_Usr_No ||'	   ,
			       Paid_Date       = SysDate
			 Where Rt_Bill_No      = '||P_Rt_Bill_No ;
    Exception
     When Others Then
      Null ;
    End ;
--##----------------------------------------------------------------------------------------------##--
		Procedure Get_PayCash_RtBillNo_Info ( P_Sqlstr	     In     Varchar2,
									P_Rt_Bill_No	     In     Number  ,
									P_Rt_Bill_Date	     In Out Date    ,
									P_Return_Type	     In Out Number  ,
									P_A_Cy		     In Out Varchar2,
									P_Rt_Bill_Rate	     In Out Number  ,
									P_Rt_Bill_Amt	     In Out Number  ,
									P_Disc_Amt	     In Out Number  ,
									P_Vat_Amt	     In Out Number  ,
									P_Cheque_Amt	     In Out Number  ,
									P_Machine_No	     In Out Number  ,
									P_Ad_U_Id	     In Out Number  ,
									P_Ad_Date	     In Out Date    ,
									P_Machine_No_Rt_Bill In Out Number  ,
									P_Bill_No	     In Out Number  ,
									P_QT_CPN_RPLC_AMT    In Out Number  ) Is
		   Begin
		      Execute Immediate P_Sqlstr Into  P_Rt_Bill_Date	   ,
						       P_Return_Type	   ,
						       P_A_Cy		   ,
						       P_Rt_Bill_Rate	   ,
						       P_Rt_Bill_Amt	   ,
						       P_Disc_Amt	   ,
						       P_Vat_Amt	   ,
						       P_Cheque_Amt	   ,
						       P_Machine_No	   ,
						       P_Ad_U_Id   ,
						       P_Ad_Date   ,
						       P_Machine_No_Rt_Bill,
						       P_Bill_No ,
						       P_QT_CPN_RPLC_AMT;
		 End Get_PayCash_RtBillNo_Info ;
--##----------------------------------------------------------------------------------------------##-- 		
			 Procedure Get_PayCash_BillNo_Info ( P_Sqlstr	    In	   Varchar2,
							    P_Bill_No	   In	  Number  ,
							    P_Bill_Date    In Out Date	  ,
							    P_Ad_U_Id	   In Out Number  ,
							    P_Ad_Date	   In Out Date	  ,
							    P_Machine_No   In Out Number  ,
							    P_Brn_No	   In Out Number  ) Is
			   Begin
			      Execute Immediate P_Sqlstr Into  P_Bill_Date     ,
							       P_Ad_U_Id       ,
							       P_Ad_Date       ,
							       P_Machine_No    ,
							       P_Brn_No        ;
			   End Get_PayCash_BillNo_Info ;
--##----------------------------------------------------------------------------------------------##-- 			
				 Procedure Get_Price_From_Bill( P_Sqlstr       In   Varchar2	 ,
								P_Bill_No      In   Number	 ,
								P_I_Code       In   Varchar2	 ,
								P_P_Qty        In Out	  Number ,
					P_I_Qty        In Out	  Number ,
					P_Free_Qty     In Out	  Number ,
					P_I_Price      In Out	  Number ,
					P_I_Price_Vat  In Out	  Number ,
					P_Dis_Amt_Mst  In Out	  Number ,
					P_Dis_Amt_Mst_Vat In Out  Number ,
					P_Dis_Amt_Dtl  In Out	  Number ,
					P_Vat_Per      In Out	  Number ,
					P_Vat_Amt      In Out	  Number ,
					P_Dis_Amt_Dtl_Vat  In Out Number,
					P_Dis_Aftr_Vat_Mst In Out Number,
					P_Qr_Code	   In Out Varchar2,
					P_Emp_No	   In Out Number,
					P_Itm_Unt	   In Out Varchar2 ) Is
					   Begin
					      Execute Immediate P_Sqlstr Into  P_P_Qty	     ,
									       P_I_Qty	     ,
						       P_Free_Qty    ,
									       P_I_Price     ,
						       P_I_Price_Vat ,
									       P_dis_amt_mst ,
									       P_dis_amt_mst_vat,
									       P_dis_amt_dtl ,
						       P_Vat_Per     ,
									       P_Vat_Amt     ,
						       P_Dis_Amt_Dtl_Vat,
						       P_Dis_Aftr_Vat_Mst,
						       P_Qr_Code,
						       P_Emp_No,
						       P_Itm_Unt;
				End Get_Price_From_Bill  ;			
--##----------------------------------------------------------------------------------------------##--
Procedure Get_Data_From_Bill_Mst (P_Sqlstr	  In   Varchar2     ,
					     P_Bill_No	       In   Number	 ,
				 P_cust_code	   In Out    Number ,
							       P_Mobile_No	 In Out     Number ,
							       P_Point_Typ_No	 In Out     Number ,
							       P_CRD_DISC_PER	 In Out     Number ,
							       P_Disc_Amt_Hl_Prm In Out     Number ,
							       P_Bill_Date	 In Out     Date ,
							       P_Emp_no 	 In Out     Number ,
							       P_Bill_Rtrn	 In Out     Number ,
							       P_Clc_Typ_No_Tax  In Out     Number ,
							       P_Qt_Cpn_Amt	 In Out     Number ,
							       P_Card_Amt	 In Out     Number ,
							       P_Card_Amt_Free	 In Out     Number ,
							       P_Net_Amt_Bill	 In Out     Number,
							       P_PYMNT_AC	 In Out     Number,
				 P_AC_CODE	   In Out     Varchar2,
				 P_AC_CODE_DTL	   In Out     Varchar2,
				 P_AC_DTL_TYP	   In Out     Number,
				 P_AC_AMT	   In Out     Number) Is
Begin
					   Execute Immediate P_Sqlstr Into  P_cust_code,
							    P_Mobile_No,
							    P_Point_Typ_No,
							    P_CRD_DISC_PER,
							    P_Disc_Amt_Hl_Prm,
							    P_Bill_Date,
							    P_Emp_no,
							    P_Bill_Rtrn,
							    P_Clc_Typ_No_Tax,
							    P_Qt_Cpn_Amt,
							    P_Card_Amt,
							    P_Card_Amt_Free,
							    P_Net_Amt_Bill,
							    P_Pymnt_Ac,
							    P_Ac_Code,
							    P_Ac_Code_Dtl,
							    P_Ac_Dtl_Typ,
							    P_Ac_Amt;
End Get_Data_From_Bill_Mst;
--##----------------------------------------------------------------------------------------------##--
PROCEDURE UPDATE_POS_SERVER_DB_LINK ( P_DB_LINK IN VARCHAR2 ) IS
 V_HOST_NAME	  V$INSTANCE.HOST_NAME%TYPE;
 V_SERVER_NM	  IAS_POS_SERVER_DB_LINK.SERVER_NM%TYPE;
 V_SERVER_NO	  IAS_POS_SERVER_DB_LINK.SERVER_NO%TYPE;
 V_ATHRTY_SRVR_NO IAS_POS_SERVER_DB_LINK.SERVER_NO%TYPE;
 V_CNT		  NUMBER:=0;
 V_DB_LINK	  VARCHAR(50);
BEGIN

  BEGIN
   SELECT 1
     INTO  V_CNT
    FROM   DBA_SNAPSHOTS
     WHERE TABLE_NAME = 'IAS_ITM_MST'
      AND  OWNER      =  USER
      AND  ROWNUM <= 1 ;
  EXCEPTION WHEN OTHERS THEN
      V_CNT :=	0 ;
  END ;
  IF NVL(V_Cnt,0)=0 THEN
    V_DB_LINK:='';
  ELSE
    V_DB_LINK:='@'||P_DB_LINK;
  END IF;
  BEGIN
   SELECT HOST_NAME INTO V_HOST_NAME FROM V$INSTANCE WHERE UPPER(STATUS)=UPPER('OPEN');
  EXCEPTION WHEN OTHERS THEN
    V_HOST_NAME:='';
  END;
  IF V_HOST_NAME IS NOT NULL THEN
	BEGIN
	  V_SERVER_NO:=IAS_GEN_PKG.GET_CNT('SELECT SERVER_NO
					FROM '||USER||'.IAS_POS_SERVER_DB_LINK'||V_DB_LINK||'
					 WHERE ROWNUM <= 1 AND UPPER(SERVER_NM)=UPPER('''||V_HOST_NAME||''')');
	EXCEPTION WHEN OTHERS THEN
	    V_SERVER_NO:='';
	END;
	IF NVL(V_SERVER_NO,0)=0 THEN
	     BEGIN
	      SELECT SERVER_NO INTO V_ATHRTY_SRVR_NO
	       FROM IAS_SYS.S_TRMNLS_AUTHRTY
		WHERE UPPER(TRMNL_NAME)=UPPER(''||V_HOST_NAME||'')
		  AND NVL(SERVER_MCH,0)=1
		  AND SYS_NO=2
		  AND ROWNUM <= 1;
	     EXCEPTION WHEN OTHERS THEN
		V_ATHRTY_SRVR_NO:='';
	     END;
	     IF NVL(V_ATHRTY_SRVR_NO,'')='' THEN
		 BEGIN
		  SELECT MACHINE_NO INTO V_ATHRTY_SRVR_NO
		   FROM IAS_POS_MACHINE
		    WHERE UPPER(TERMINAL)=UPPER(''||V_HOST_NAME||'')
		      AND ROWNUM <= 1;
		 EXCEPTION WHEN OTHERS THEN
		    V_ATHRTY_SRVR_NO:='';
		 END;
	     END IF;
	     IF NVL(V_ATHRTY_SRVR_NO,0)>0 THEN
		 BEGIN
		  V_SERVER_NO:=IAS_GEN_PKG.GET_CNT('SELECT SERVER_NO
					    FROM '||USER||'.IAS_POS_SERVER_DB_LINK'||V_DB_LINK||'
					     WHERE SERVER_NO='||V_ATHRTY_SRVR_NO);
		 EXCEPTION WHEN OTHERS THEN
		     V_SERVER_NO:='';
		 END;

			     IF NVL(V_SERVER_NO,0)=0 OR ( NVL(V_SERVER_NO,0)>0 AND NVL(V_ATHRTY_SRVR_NO,0)>0 ) THEN --##FOUND THE SAME SERVER NO IN IAS_POS_SERVER_DB_LINK
				 BEGIN
				  V_SERVER_NO:=IAS_GEN_PKG.GET_CNT('SELECT NVL(MAX(SERVER_NO),0)+1
							    FROM '||USER||'.IAS_POS_SERVER_DB_LINK'||V_DB_LINK);
				 EXCEPTION WHEN OTHERS THEN
				     V_SERVER_NO:='';
				 END;
			     END IF;
			     IF NVL(V_SERVER_NO,0)>0 THEN
			       EXECUTE IMMEDIATE ' INSERT INTO '||USER||'.IAS_POS_SERVER_DB_LINK'||V_DB_LINK||'
						       (SERVER_NO,SERVER_NM) VALUES ('||V_SERVER_NO||','''||V_HOST_NAME||''')';
			      COMMIT;
			     END IF;
		       END IF;
	END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
   --Raise_Application_Error(-20020,'Error  WHEN INSERT POS SERVER IAS_POS_SERVER_DB_LINK ' || '' || Sqlerrm);
     NULL;
END  UPDATE_POS_SERVER_DB_LINK;
--##----------------------------------------------------------------------------------------------##--
PROCEDURE EXECUTE_SQL_PRC (Sqlstr Varchar2) IS
BEGIN
     EXECUTE IMMEDIATE SQLSTR;
EXCEPTION WHEN OTHERS THEN
NULL;
END EXECUTE_SQL_PRC;
--##----------------------------------------------------------------------------------------------##--
End Ias_Pos_Distibuted_Db_Pkg ;
/

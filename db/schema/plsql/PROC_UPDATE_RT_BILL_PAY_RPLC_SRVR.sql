-- PROCEDURE: UPDATE_RT_BILL_PAY_RPLC_SRVR (status: VALID)
CREATE OR REPLACE
PROCEDURE  UPDATE_RT_BILL_PAY_RPLC_SRVR IS
							  BEGIN
								   BEGIN
								      Update IAS_POS_RT_BILL_MST SET PAYED =1
									  WHERE PAYED=0 AND EXISTS (SELECT RT_BILL_NO FROM IAS_POS_PAY_BILLS WHERE IAS_POS_PAY_BILLS.RT_BILL_NO=IAS_POS_RT_BILL_MST.RT_BILL_NO AND RT_BILL_NO IS NOT NULL ) ;								
								     COMMIT;
								  EXCEPTION WHEN OTHERS THEN
								     NULL;
								  END;	     	
							  --##-------------------------------------------------------------------------------------------------------------------------------------##--
		 BEGIN
		     UPDATE IAS_POS_RT_BILL_MST  SET PAYED =2
									 WHERE PAYED=0 AND EXISTS (SELECT RT_BILL_NO FROM IAS_POS_PAY_CASH WHERE IAS_POS_PAY_CASH.RT_BILL_NO=IAS_POS_RT_BILL_MST.RT_BILL_NO AND RT_BILL_NO IS NOT NULL );  									  								
		 EXCEPTION WHEN OTHERS THEN
								     NULL;
								 END;									  								  								
								  COMMIT;								
								  --##-------------------------------------------------------------------------------------------------------------------------------------##--
								Begin
						    	   Update Ias_Pos_Customer_Card_Amount Set  Processed =1 ,REM_CARD_AMT=(SELECT SUM(PAY_AMT) FROM IAS_POS_PAY_BILLS WHERE IAS_POS_PAY_BILLS.CARD_NO=Ias_Pos_Customer_Card_Amount.CARD_NO AND CARD_NO IS NOT NULL)
				   where Nvl(Processed,0)=0 And EXISTS (SELECT CARD_NO FROM IAS_POS_PAY_BILLS WHERE IAS_POS_PAY_BILLS.CARD_NO=Ias_Pos_Customer_Card_Amount.CARD_NO AND CARD_NO IS NOT NULL );						   			    						    	
			   COMMIT;
	    				    Exception When Others Then
	    				    		null;
	    				    End;
								  --##-------------------------------------------------------------------------------------------------------------------------------------##--
								EXCEPTION WHEN OTHERS THEN
								   NULL;
							END UPDATE_RT_BILL_PAY_RPLC_SRVR;
/

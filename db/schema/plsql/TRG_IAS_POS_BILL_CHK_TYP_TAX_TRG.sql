-- TRIGGER: IAS_POS_BILL_CHK_TYP_TAX_TRG (status: VALID)
CREATE OR REPLACE
TRIGGER Ias_Pos_Bill_Chk_TYP_TAX_TRG
				BEFORE	INSERT
				ON IAS_POS_BILL_MST
				REFERENCING NEW AS NEW
				FOR EACH ROW				
				DECLARE
				V_CLC_TYP_NO_TAX  NUMBER(5);
				BEGIN
			  If Inserting	Then
			      Begin
			       IF  Nvl(:NEW.VAT_AMT,0) > 0 THEN
					       IF :New.CLC_TYP_NO_TAX IS NULL THEN
						  Raise_application_error(-20601,'CLC_TYP_NO_TAX NOT FOUND FOR BILL NO '||:NEW.BILL_NO) ;
					       ELSE
						   SELECT  CLC_TYP_NO_TAX INTO V_CLC_TYP_NO_TAX from ias_pos_machine WHERE MACHINE_NO=:New.MACHINE_NO;
						   IF V_CLC_TYP_NO_TAX IS NOT NULL AND	   :New.CLC_TYP_NO_TAX IS NULL THEN
						      Raise_application_error(-20602,'CLC_TYP_NO_TAX NOT FOUND FOR BILL NO '||:NEW.BILL_NO) ;
						   END IF;
					      END IF;
					    END IF;					
			      End;
			  End If;
       END;
/

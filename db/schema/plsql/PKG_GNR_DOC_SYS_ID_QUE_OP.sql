-- =============================================
-- PACKAGE SPEC: GNR_DOC_SYS_ID_QUE_OP  (status: VALID)
-- =============================================
CREATE OR REPLACE
Package Gnr_Doc_Sys_Id_Que_Op
As

  Procedure Set_Doc_Msg ( P_Sys_No	      Number,
			  P_Doc_Typ	      Number,
			  P_Doc_Srl	      Number,
			  P_Cmp_No	      Number,
			  P_Doc_Sq_M	      Number,
			  P_Idntfr_Clmn_Nm    Varchar2,
			  P_Tbl_Nm	      Varchar2,
			  P_Tbl_Upd_Whr       Varchar2);
  Procedure Doc_Invlid_Msg_Enque (Doc_Sys_Id_Typ_Obj Doc_Sys_Id_Typ);
  Procedure Doc_Sys_Id_Q_Job_Prcdr (Event_Message Doc_Sys_Id_Typ);
  Procedure Get_Doc_Msg (Event_Message Doc_Sys_Id_Typ, P_Msg_Id Raw);
  Procedure Setup_Sch_Job;
  Procedure Setup_Que_Tbl;
  Procedure Remove_Que_Setup;

End Gnr_Doc_Sys_Id_Que_Op;
/

-- ---------------------------------------------
-- PACKAGE BODY: GNR_DOC_SYS_ID_QUE_OP  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY gnr_doc_sys_id_que_op
IS
   ENQ_OPTNS_rcrd    DBMS_AQ.ENQUEUE_OPTIONS_T;

   MSg_PRPRTS_rcrd   DBMS_AQ.MESSAGE_PROPERTIES_T;



   PROCEDURE set_gnr_stng
   AS
   BEGIN
      ENQ_OPTNS_rcrd.visibility := DBMS_AQ.ON_COMMIT;
      ENQ_OPTNS_rcrd.delivery_mode := DBMS_AQ.PERSISTENT;
      MSg_PRPRTS_rcrd.priority := 1;
      MSg_PRPRTS_rcrd.delay := DBMS_AQ.NO_DELAY;
      MSg_PRPRTS_rcrd.expiration := DBMS_AQ.never;

      MSg_PRPRTS_rcrd.attempts := 5;
      --recipient_list AQ$_RECIPIENT_LIST_T,
      MSg_PRPRTS_rcrd.exception_queue := 'DOC_SYS_ID_Q_EXCPTN';
      MSg_PRPRTS_rcrd.enqueue_time := SYSDATE;
      --state BINARY_INTEGER,
      --sender_id SYS.AQ$_AGENT DEFAULT NULL,
      --original_msgid RAW(16) DEFAULT NULL,
      --transaction_group VARCHAR2(30) DEFAULT NULL,
      --user_property SYS.ANYDATA DEFAULT NULL
      MSg_PRPRTS_rcrd.delivery_mode := DBMS_AQ.PERSISTENT;
   END set_gnr_stng;

   FUNCTION get_msg_str (DOC_SYS_ID_TYP_obj DOC_SYS_ID_TYP)
      RETURN VARCHAR2
   IS
      msg_str	VARCHAR2 (500);
   BEGIN
      msg_str := NULL;

      IF DOC_SYS_ID_TYP_obj.tbl_nm IS NOT NULL
      THEN
	 msg_str :=
	       'DOC_SRL['
	    || DOC_SYS_ID_TYP_obj.DOC_SRL
	    || '] '
	    || 'DOC_SQ_M['
	    || DOC_SYS_ID_TYP_obj.DOC_SQ_M
	    || '] '
	    || 'CMP_NO['
	    || DOC_SYS_ID_TYP_obj.CMP_NO
	    || '] '
	    || 'IDNTFR_CLMN_NM['
	    || DOC_SYS_ID_TYP_obj.IDNTFR_CLMN_NM
	    || '] '
	    || 'TBL_NM['
	    || DOC_SYS_ID_TYP_obj.TBL_NM
	    || '] '
	    || 'TBL_UPD_WHR['
	    || DOC_SYS_ID_TYP_obj.TBL_UPD_WHR
	    || '] '
	    || 'UPD_OP_TYP['
	    || DOC_SYS_ID_TYP_obj.UPD_OP_TYP
	    || '] '
	    || 'sys_no['
	    || DOC_SYS_ID_TYP_obj.sys_no
	    || '] '
	    || 'doc_type['
	    || DOC_SYS_ID_TYP_obj.doc_type
	    || '] ';
      END IF;

      RETURN msg_str;
   END get_msg_str;

   PROCEDURE set_doc_msg (p_sys_no	      NUMBER,
			  p_doc_typ	      NUMBER,
			  p_DOC_SRL	      NUMBER,
			  p_CMP_NO	      NUMBER,
			  p_DOC_SQ_M	      NUMBER,
			  p_IDNTFR_CLMN_NM    VARCHAR2,
			  p_TBL_NM	      VARCHAR2,
			  p_TBL_UPD_WHR       VARCHAR2)
   AS
      DOC_SYS_ID_TYP_obj   DOC_SYS_ID_TYP;
      v_msgid		   RAW (16);

      PROCEDURE tst_tbl_nm
      AS
	 v_sql	 VARCHAR2 (255);
	 v_cnt	 NUMBER := 0;
      BEGIN
	 v_sql := 'select max(1) from ' || p_TBL_NM;

	 EXECUTE IMMEDIATE v_sql INTO v_cnt;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    raise_application_error (
	       -20456,
	       'Doc_sys_id_que_op.Set_doc_msg Error In Table Name');
      END tst_tbl_nm;
      PROCEDURE Tst_Cmo_No
      AS
	 v_sql	 VARCHAR2 (255);
	 v_cnt	 NUMBER := 0;
      BEGIN
	 v_sql := 'select max(1) from ' || p_TBL_NM || ' WHERE CMP_NO='||P_CMP_NO;

	 EXECUTE IMMEDIATE v_sql INTO v_cnt;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    raise_application_error (
	       -20456,
	       'Doc_sys_id_que_op.Set_doc_msg Error In Cmp_No');
      END Tst_Cmo_No;

      PROCEDURE tst_doc_srl
      AS
	 v_sql	 VARCHAR2 (255);
	 v_cnt	 NUMBER := 0;
      BEGIN
	 IF	p_TBL_UPD_WHR IS NULL
	    AND (NVL (P_DOC_SQ_M, 0) > 0 OR NVL (P_DOC_SRL, 0) > 0)
	 THEN
	    BEGIN
	       v_sql :=
		     'select 1 from '
		  || p_TBL_NM
		  || ' where '
		  || p_IDNTFR_CLMN_NM
		  || '='
		  || CASE
			WHEN NVL (p_DOC_SRL, 0) > 0 THEN p_DOC_SRL
			ELSE p_DOC_SQ_M
		     END;

	       EXECUTE IMMEDIATE v_sql INTO v_cnt;
	    EXCEPTION
	       WHEN OTHERS
	       THEN
		  raise_application_error (
		     -20456,
		     'Doc_sys_id_que_op.Set_doc_msg Error In doc serial or sequence');
	    END;
	 END IF;
      END tst_doc_srl;

      PROCEDURE tst_doc_whr
      AS
	 v_sql	 VARCHAR2 (255);
	 v_cnt	 NUMBER := 0;
      BEGIN
	 IF p_TBL_UPD_WHR IS NOT NULL
	 THEN
	    BEGIN
	       v_sql :=
		     'select 1 from '
		  || p_TBL_NM
		  || ' where '
		  || ' 1=1 '
		  || p_TBL_UPD_WHR;

	       EXECUTE IMMEDIATE v_sql INTO v_cnt;
	    EXCEPTION
	       WHEN OTHERS
	       THEN
		  raise_application_error (
		     -20456,
		     'Doc_sys_id_que_op.Set_doc_msg Error In  where formula');
	    END;
	 END IF;
      END tst_doc_whr;

      PROCEDURE doc_msg_enque
      AS
      BEGIN
	 DBMS_AQ.ENQUEUE (queue_name	       => USER || '.DOC_SYS_ID_Q',
			  enqueue_options      => ENQ_OPTNS_rcrd,
			  message_properties   => MSg_PRPRTS_rcrd,
			  payload	       => DOC_SYS_ID_TYP_obj,
			  msgid 	       => v_msgid);
      END doc_msg_enque;
   BEGIN
      set_gnr_stng;
      DOC_SYS_ID_TYP_obj :=
	 DOC_SYS_ID_TYP (DOC_SRL	  => NULL,
			 DOC_SQ_M	  => NULL,
			 CMP_NO 	  => NULL,
			 IDNTFR_CLMN_NM   => NULL,
			 TBL_NM 	  => NULL,
			 TBL_UPD_WHR	  => NULL,
			 UPD_OP_TYP	  => NULL,
			 doc_type	  => NULL,
			 sys_no 	  => NULL);

      IF     (	 (    (NVL (p_DOC_SRL, 0) > 0 OR NVL (p_DOC_SQ_M, 0) > 0)
		  AND LENGTH (NVL (p_IDNTFR_CLMN_NM, '')) > 3)
	      OR LENGTH (NVL (p_TBL_UPD_WHR, '')) > 10)
	 AND LENGTH (NVL (p_TBL_NM, '')) > 3
      THEN
	 tst_tbl_nm;
	 Tst_Cmo_No;
	 tst_doc_srl;
	 tst_doc_whr;

	 DOC_SYS_ID_TYP_obj.DOC_SRL := p_DOC_SRL;
	 DOC_SYS_ID_TYP_obj.DOC_SQ_M := p_DOC_SQ_M;
	 DOC_SYS_ID_TYP_obj.IDNTFR_CLMN_NM := p_IDNTFR_CLMN_NM;
	 DOC_SYS_ID_TYP_obj.TBL_NM := p_TBL_NM;
	 DOC_SYS_ID_TYP_obj.TBL_UPD_WHR := p_TBL_UPD_WHR;
	 DOC_SYS_ID_TYP_obj.UPD_OP_TYP := 1;
	 DOC_SYS_ID_TYP_obj.SYS_NO := P_SYS_NO;
	 DOC_SYS_ID_TYP_obj.doc_type := P_doc_typ;
	 DOC_SYS_ID_TYP_obj.CMP_NO := P_CMP_NO;

	 doc_msg_enque;

      ELSE
	 RAISE NO_DATA_FOUND;
      END IF;
   END set_doc_msg;

   PROCEDURE Get_doc_msg (EVENT_MESSAGE DOC_SYS_ID_TYP, P_MSG_ID RAW)
   AS
      v_msgid		   RAW (16);
      v_err_msg 	   VARCHAR2 (500);
      v_msg_str 	   VARCHAR2 (500);

      PROCEDURE tst_tbl_nm
      AS
	 v_sql	 VARCHAR2 (255);
	 v_cnt	 NUMBER := 0;
      BEGIN
	 v_sql := 'select max(1) from ' || EVENT_MESSAGE.TBL_NM;

	 EXECUTE IMMEDIATE v_sql INTO v_cnt;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    raise_application_error (
	       -20456,
	       'Doc_sys_id_que_op.Get_doc_msg Error In Table Name');
      END tst_tbl_nm;

      PROCEDURE Tst_Cmp_No
      AS
	 v_sql	 VARCHAR2 (255);
	 v_cnt	 NUMBER := 0;
      BEGIN
	 v_sql := 'select max(1) from ' || EVENT_MESSAGE.TBL_NM||' WHERE CMP_NO='||EVENT_MESSAGE.CMP_NO;

	 EXECUTE IMMEDIATE v_sql INTO v_cnt;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    raise_application_error (
	       -20456,
	       'Doc_sys_id_que_op.Get_doc_msg Error In Cmp_No');
      END Tst_Cmp_No;

      PROCEDURE tst_doc_srl
      AS
	 v_sql	 VARCHAR2 (255);
	 v_cnt	 NUMBER := 0;
      BEGIN
	 IF	EVENT_MESSAGE.TBL_UPD_WHR IS NULL
	    AND (   NVL (EVENT_MESSAGE.DOC_SQ_M, 0) > 0
		 OR NVL (EVENT_MESSAGE.DOC_SRL, 0) > 0 )
	 THEN
	    BEGIN
	       v_sql :=
		     'select 1 from '
		  || EVENT_MESSAGE.TBL_NM
		  || ' Where CMP_NO ='
		  || EVENT_MESSAGE.CMP_NO
		  || ' and '
		  || EVENT_MESSAGE.IDNTFR_CLMN_NM
		  || '='
		  || CASE
			WHEN NVL (EVENT_MESSAGE.DOC_SRL, 0) > 0
			THEN
			   EVENT_MESSAGE.DOC_SRL
			ELSE
			   EVENT_MESSAGE.DOC_SQ_M
		     END;

	       EXECUTE IMMEDIATE v_sql INTO v_cnt;
	    EXCEPTION
	       WHEN OTHERS
	       THEN
		  raise_application_error (
		     -20456,
		     'Doc_sys_id_que_op.Get_doc_msg Error In doc serial or sequence');
	    END;
	 END IF;
      END tst_doc_srl;

      PROCEDURE tst_doc_whr
      AS
	 v_sql	 VARCHAR2 (255);
	 v_cnt	 NUMBER := 0;
      BEGIN
	 IF EVENT_MESSAGE.TBL_UPD_WHR IS NOT NULL
	 THEN
	    BEGIN
	       v_sql :=
		     'select 1 from '
		  || EVENT_MESSAGE.TBL_NM
		  || ' where '
		  || ' 1=1 '
		  || EVENT_MESSAGE.TBL_UPD_WHR;

	       EXECUTE IMMEDIATE v_sql INTO v_cnt;
	    EXCEPTION
	       WHEN OTHERS
	       THEN
		  raise_application_error (
		     -20456,
		     'Doc_sys_id_que_op.Get_doc_msg Error In  where formula');
	    END;
	 END IF;
      END tst_doc_whr;
   BEGIN


      IF     (	 (    (   NVL (EVENT_MESSAGE.DOC_SRL, 0) > 0
		       OR NVL (EVENT_MESSAGE.DOC_SQ_M, 0) > 0)
		  AND NVL (EVENT_MESSAGE.CMP_NO, 0) > 0
		  AND LENGTH (NVL (EVENT_MESSAGE.IDNTFR_CLMN_NM, '')) > 3)
	      OR LENGTH (NVL (EVENT_MESSAGE.TBL_UPD_WHR, '')) > 10)
	 AND LENGTH (NVL (EVENT_MESSAGE.TBL_NM, '')) > 3
      THEN
	 IF p_MSG_ID IS NOT NULL
	 THEN
	    tst_tbl_nm;
	    Tst_Cmp_No;
	    tst_doc_srl;
	    tst_doc_whr;


	    GNR_DOC_TYP_SQ_PKG.Set_Sys_Doc_Id_Prc(  P_Doc_Typ	 => EVENT_MESSAGE.DOC_TYPE,
						    P_Doc_Srl	 => EVENT_MESSAGE.DOC_SRL,
						    P_CMP_NO	 => EVENT_MESSAGE.CMP_NO,
						    P_Tbl_Nm	 => EVENT_MESSAGE.TBL_NM,
						    P_Srl_Fld_Nm => EVENT_MESSAGE.IDNTFR_CLMN_NM,
						    P_Frm_St	 =>'I' );




	  /* v_msg_str:=get_msg_str(EVENT_MESSAGE);
	     INSERT INTO que_msg_tbl(msg_id ,msg_str ,msg_tm_stamp ,prog_nm )
	     values
	     (p_MSG_ID,v_msg_str,SYSTIMESTAMP,'Get_doc_msg'); */

	    COMMIT;
	 END IF;
      ELSE
	 RAISE NO_DATA_FOUND;
      END IF;
   EXCEPTION
      WHEN OTHERS
      THEN
	 v_err_msg := SQLERRM;
	 v_msg_str := get_msg_str (EVENT_MESSAGE);

	 INSERT INTO que_msg_tbl (msg_id,
				  msg_str,
				  msg_tm_stamp,
				  prog_nm)
	      VALUES (p_MSG_ID,
		      v_msg_str,
		      SYSTIMESTAMP,
		      'Get_doc_msg  ' || SUBSTR (v_err_msg, 1, 180));

	 doc_INVLID_msg_enque (EVENT_MESSAGE);
	 COMMIT;
   END Get_doc_msg;

   PROCEDURE DOC_SYS_ID_Q_JOB_PRCDR (EVENT_MESSAGE DOC_SYS_ID_TYP)
   AS
      DEQU_OPTNS_RCRD	   DBMS_AQ.DEQUEUE_OPTIONS_T;
      MSG_PRPRTS_RCRD	   DBMS_AQ.MESSAGE_PROPERTIES_T;
      DOC_SYS_ID_TYP_OBJ   DOC_SYS_ID_TYP;
      V_MSG_ID		   RAW (16);
      no_messages	   EXCEPTION;
      PRAGMA EXCEPTION_INIT (no_messages, -25228);
      v_ERR_msg 	   VARCHAR2 (500);
      v_msg_str 	   VARCHAR2 (500);
   BEGIN
      --  DEQU_OPTNS_RCRD.msgid := descr.msg_id;
      DEQU_OPTNS_RCRD.consumer_name := 'DOC_SYS_ID_Q_SBSCRBR';

      LOOP
	 DEQU_OPTNS_RCRD.DEQUEUE_MODE := DBMS_AQ.REMOVE;
	 DEQU_OPTNS_RCRD.NAVIGATION := DBMS_AQ.FIRST_MESSAGE;
	 DEQU_OPTNS_RCRD.VISIBILITY := DBMS_AQ.ON_COMMIT;
	 DEQU_OPTNS_RCRD.WAIT := DBMS_AQ.NO_WAIT;
	 MSG_PRPRTS_RCRD.DELAY := DBMS_AQ.NO_DELAY;
	 MSG_PRPRTS_RCRD.STATE := DBMS_AQ.READY;

	 DBMS_AQ.DEQUEUE (queue_name	       => USER || '.DOC_SYS_ID_Q',
			  dequeue_options      => DEQU_OPTNS_RCRD,
			  message_properties   => MSG_PRPRTS_RCRD,
			  payload	       => DOC_SYS_ID_TYP_OBJ,
			  msgid 	       => V_MSG_ID);
	 v_msg_str := get_msg_str (DOC_SYS_ID_TYP_OBJ);

	 INSERT INTO que_msg_tbl (msg_id,
				  msg_str,
				  msg_tm_stamp,
				  prog_nm)
		 VALUES (
			   V_MSG_ID,
			   v_msg_str,
			   SYSTIMESTAMP,
			      'DOC_SYS_ID_Q_JOB_PRCDR  '
			   || SUBSTR (v_err_msg, 1, 180));

	 Get_doc_msg (EVENT_MESSAGE   => DOC_SYS_ID_TYP_OBJ,
		      p_MSG_ID	      => V_MSG_ID);
	 COMMIT;
	 DEQU_OPTNS_RCRD.NAVIGATION := DBMS_AQ.NEXT_MESSAGE;
      END LOOP;
   EXCEPTION
      WHEN no_messages
      THEN
	 INSERT INTO que_msg_tbl (msg_id,
				  msg_str,
				  msg_tm_stamp,
				  prog_nm)
		 VALUES (
			   NULL,
			   NULL,
			   SYSTIMESTAMP,
			   'DOC_SYS_ID_Q_JOB_PRCDR  [No more messages for processing]');
      WHEN OTHERS
      THEN
	 v_err_msg := SQLERRM;

	 INSERT INTO que_msg_tbl (msg_id,
				  msg_str,
				  msg_tm_stamp,
				  prog_nm)
		 VALUES (
			   NULL,
			   NULL,
			   SYSTIMESTAMP,
			      'DOC_SYS_ID_Q_JOB_PRCDR  '
			   || SUBSTR (v_err_msg, 1, 180));


	 COMMIT;
   END DOC_SYS_ID_Q_JOB_PRCDR;

   PROCEDURE doc_INVLID_msg_enque (DOC_SYS_ID_TYP_obj DOC_SYS_ID_TYP)
   AS
      v_msgid	RAW (16);
   BEGIN
      DBMS_AQ.ENQUEUE (queue_name	    => USER || '.DOC_SYS_ID_Q_INVLID',
		       enqueue_options	    => ENQ_OPTNS_rcrd,
		       message_properties   => MSg_PRPRTS_rcrd,
		       payload		    => DOC_SYS_ID_TYP_obj,
		       msgid		    => v_msgid);
   EXCEPTION
      WHEN OTHERS
      THEN
	 NULL;
   END doc_INVLID_msg_enque;

   PROCEDURE setup_sch_job
   AS
   BEGIN
      BEGIN
	 DBMS_SCHEDULER.CREATE_EVENT_SCHEDULE (
	    schedule_name   => USER || '.DOC_SYS_ID_Q_EVNTS_SCHDL',
	    start_date	    => SYSTIMESTAMP,
	    --event_condition => 'tab.user_data. = ',
	    queue_spec	    => USER || '.DOC_SYS_ID_Q');
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    NULL;
      END;


      BEGIN
	 DBMS_SCHEDULER.create_program (
	    program_name	  => USER || '.doc_sys_id_prog',
	    program_action	  =>	USER
				     || '.gnr_doc_sys_id_que_op.DOC_SYS_ID_Q_JOB_PRCDR',
	    program_type	  => 'STORED_PROCEDURE',
	    number_of_arguments   => 1,
	    enabled		  => FALSE);
	 DBMS_SCHEDULER.define_metadata_argument (
	    program_name	 => USER || '.doc_sys_id_prog',
	    argument_position	 => 1,
	    metadata_attribute	 => 'EVENT_MESSAGE');
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    NULL;
      END;

      BEGIN
	 DBMS_SCHEDULER.enable (USER || '.doc_sys_id_prog');
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    NULL;
      END;

      BEGIN
	 DBMS_SCHEDULER.CREATE_JOB (
	    job_name	    => USER || '.doc_sys_id_job',
	    program_name    => USER || '.doc_sys_id_prog',
	    schedule_name   => USER || '.DOC_SYS_ID_Q_EVNTS_SCHDL',
	    enabled	    => TRUE,
	    comments	    => 'Give doc_sys_id for opreations');
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    NULL;
      END;
   END setup_sch_job;

   PROCEDURE setup_que_tbl
   AS
   BEGIN
      BEGIN
	 DBMS_AQADM.CREATE_QUEUE_TABLE (
	    queue_table 	 => USER || '.DOC_SYS_ID_Q_TBL',
	    queue_payload_type	 => USER || '.DOC_SYS_ID_TYP',
	    storage_clause	 => 'TABLESPACE dflt_data_input',
	    multiple_consumers	 => TRUE,
	    sort_list		 => 'PRIORITY,ENQ_TIME',
	    comment		 => 'queue table  recive message from documents request id ');
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    NULL;
      END;


      -------------------------------------------------------
      -------------------CREATE QUEUE AND START ---------------

      BEGIN
	 DBMS_AQADM.CREATE_QUEUE (
	    queue_name	  => USER || '.DOC_SYS_ID_Q',
	    queue_table   => USER || '.DOC_SYS_ID_Q_TBL',
	    queue_type	  => DBMS_AQADM.NORMAL_QUEUE,
	    max_retries   => 5,
	    retry_delay   => 3,
	    comment	  => 'queue recive  message from documents request id ');
	 DBMS_AQADM.START_QUEUE (queue_name => USER || '.DOC_SYS_ID_Q');
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    NULL;
      END;

      -----------------------------------------------
      BEGIN
	 DBMS_AQADM.CREATE_QUEUE (
	    queue_name	  => USER || '.DOC_SYS_ID_Q_INVLID',
	    queue_table   => USER || '.DOC_SYS_ID_Q_TBL',
	    queue_type	  => DBMS_AQADM.NORMAL_QUEUE,
	    max_retries   => 5,
	    retry_delay   => 3,
	    comment	  => 'queue recive invalid message from documents request id ');
	 DBMS_AQADM.START_QUEUE (queue_name => USER || '.DOC_SYS_ID_Q_INVLID');
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    NULL;
      END;

      -------------------CREATE QUEUE AND START ---------------

      BEGIN
	 DBMS_AQADM.CREATE_QUEUE (
	    queue_name	  => USER || '.DOC_SYS_ID_Q_EXCPTN',
	    queue_table   => USER || '.DOC_SYS_ID_Q_TBL',
	    queue_type	  => DBMS_AQADM.EXCEPTION_QUEUE,
	    comment	  => 'EXCEPTION_QUEUE for message from documents request id ');
	 DBMS_AQADM.START_QUEUE (
	    queue_name	 => USER || '.DOC_SYS_ID_Q_EXCPTN',
	    ENQUEUE	 => FALSE,
	    DEQUEUE	 => TRUE);
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    NULL;
      END;

      -----------------------------------------------
      BEGIN					     --DOC_SYS_ID_Q_CLBK_PRCDR
	 DBMS_AQADM.ADD_SUBSCRIBER (
	    queue_name	 => USER || '.DOC_SYS_ID_Q',
	    subscriber	 => SYS.AQ$_AGENT ('DOC_SYS_ID_Q_SBSCRBR', NULL, NULL));
      /* DBMS_AQ.REGISTER (SYS.AQ$_REG_INFO_LIST (SYS.AQ$_REG_INFO (
						   'DOC_SYS_ID_Q:DOC_SYS_ID_Q_SBSCRBR',
						   DBMS_AQ.NAMESPACE_AQ,
						   'plsql://DOC_SYS_ID_Q_CLBK_PRCDR',
						   HEXTORAW ('FF'))),
			 1);*/
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    NULL;
      END;
   END setup_que_tbl;

   PROCEDURE remove_que_setup
   AS
   BEGIN
      BEGIN
	 DBMS_AQADM.remove_SUBSCRIBER (
	    queue_name	 => USER || '.DOC_SYS_ID_Q',
	    subscriber	 => SYS.AQ$_AGENT ('DOC_SYS_ID_Q_SBSCRBR', NULL, NULL));
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    NULL;
      END;

      BEGIN
	 DBMS_AQADM.STOP_QUEUE (queue_name => USER || '.DOC_SYS_ID_Q');
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    NULL;
      END;

      BEGIN
	 DBMS_AQADM.DROP_QUEUE (queue_name => USER || '.DOC_SYS_ID_Q');
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    NULL;
      END;

      BEGIN
	 DBMS_AQADM.STOP_QUEUE (queue_name => USER || '.DOC_SYS_ID_Q_INVLID');
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    NULL;
      END;

      BEGIN
	 DBMS_AQADM.DROP_QUEUE (queue_name => USER || '.DOC_SYS_ID_Q_INVLID');
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    NULL;
      END;

      BEGIN
	 DBMS_AQADM.STOP_QUEUE (queue_name => USER || '.DOC_SYS_ID_Q_EXCPTN');
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    NULL;
      END;

      BEGIN
	 DBMS_AQADM.DROP_QUEUE (queue_name => USER || '.DOC_SYS_ID_Q_EXCPTN');
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    NULL;
      END;

      BEGIN
	 DBMS_AQADM.DROP_QUEUE_TABLE (
	    queue_table   => USER || '.DOC_SYS_ID_Q_TBL');
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    NULL;
      END;


	 EXCEPTION	   WHEN OTHERS
	 THEN
	    NULL;  -------------------------------------------
end remove_que_setup;
----------------
END gnr_doc_sys_id_que_op;
/

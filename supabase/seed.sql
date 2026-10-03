-- Optional development reference data. Run manually AFTER the schema migration.
-- Fixed UUIDs make rerunning safe; existing rows and edits are never overwritten.
-- Sample absences use the current month in Asia/Jakarta, captured on the first seed run.
begin;
insert into public.employees (id, name, active) values
('10000000-0000-4000-8000-000000000001','Phan Nam Quân',true),
('10000000-0000-4000-8000-000000000002','Nguyễn Trung Thuận',true),
('10000000-0000-4000-8000-000000000003','Liểu Ngọc Thiện',true),
('10000000-0000-4000-8000-000000000004','Bé',true),
('10000000-0000-4000-8000-000000000005','Hoàng Ngọc Linh',true),
('10000000-0000-4000-8000-000000000006','Ngô Tuấn Kiệt',true),
('10000000-0000-4000-8000-000000000007','Đặng Mai Phương',true)
on conflict (id) do nothing;
insert into public.absences (id,employee_id,date,type,note) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002',(date_trunc('month',now() at time zone 'Asia/Jakarta') + interval '1 day')::date,'paid_leave','Việc gia đình'),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002',(date_trunc('month',now() at time zone 'Asia/Jakarta') + interval '7 days')::date,'paid_leave',null),
('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000005',(date_trunc('month',now() at time zone 'Asia/Jakarta') + interval '1 day')::date,'unpaid_leave','Nghỉ cá nhân'),
('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000003',(date_trunc('month',now() at time zone 'Asia/Jakarta') + interval '14 days')::date,'paid_leave',null)
on conflict do nothing;
-- monthly_settings intentionally stays empty: the application computes defaults.
commit;

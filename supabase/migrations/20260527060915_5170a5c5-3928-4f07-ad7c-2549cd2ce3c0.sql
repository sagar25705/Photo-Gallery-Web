
alter table public.photos add constraint photos_profile_fk foreign key (user_id) references public.profiles(id) on delete cascade;
alter table public.comments add constraint comments_profile_fk foreign key (user_id) references public.profiles(id) on delete cascade;

from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "SupportSphere Administration"
admin.site.site_title = "SupportSphere Admin Portal"
admin.site.index_title = "Support Operations Dashboard"
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),
    path("api/", include("tickets.urls")),
]

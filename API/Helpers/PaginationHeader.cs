using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Helpers
{
  // Pagination header to be added in a HTTP res 
  public class PaginationHeader
  {
    public PaginationHeader(int currentPage, int itemsPerPage, int totalItems, int totalPages)
    {
      CurrentPage = currentPage;
      ItemsPerPage = itemsPerPage;
      TotalItems = totalItems;
      TotalPages = totalPages;
    }

    public int CurrentPage { get; set; }
    public int ItemsPerPage { get; set; }
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
  }
}
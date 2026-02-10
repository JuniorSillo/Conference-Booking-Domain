using ConferenceBookingWebApi.DTOs.Responses;
using Microsoft.AspNetCore.Http;
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using ConferenceBooking.Domain.Exceptions;


namespace ConferenceBookingWebApi.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;

    public GlobalExceptionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
{
    context.Response.ContentType = "application/json";

    var response = new ErrorResponseDto
    {
        ErrorCategory = "UnexpectedError",
        ErrorCode = "ServerError",
        Message = "An unexpected error occurred."
    };

    HttpStatusCode statusCode = HttpStatusCode.InternalServerError;

    // Log the REAL exception details first (critical!)
    Console.WriteLine("───────────────────────────────────────────────");
    Console.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss UTC}] EXCEPTION CAUGHT");
    Console.WriteLine($"Type: {exception.GetType().FullName}");
    Console.WriteLine($"Message: {exception.Message}");
    Console.WriteLine($"StackTrace: {exception.StackTrace?.Replace("\r\n", " | ")}");
    if (exception.InnerException != null)
    {
        Console.WriteLine($"InnerException: {exception.InnerException.Message}");
    }
    Console.WriteLine("Request Path: " + context.Request.Path);
    Console.WriteLine("Request Method: " + context.Request.Method);
    Console.WriteLine("───────────────────────────────────────────────");

    // Then map to response (your existing logic)
    if (exception is InvalidBookingTimeException)
    {
        statusCode = HttpStatusCode.BadRequest;
        response.ErrorCategory = "ClientValidation";
        response.ErrorCode = "InvalidTimeRange";
        response.Message = exception.Message;
        response.Details = "Please check the start and end times.";
    }
    else if (exception is RoomNotFoundException)
    {
        statusCode = HttpStatusCode.BadRequest;
        response.ErrorCategory = "ClientInput";
        response.ErrorCode = "RoomNotFound";
        response.Message = exception.Message;
        response.Details = "Verify the RoomID and try again.";
    }
    else if (exception is BookingConflictException)
    {
        statusCode = HttpStatusCode.Conflict;
        response.ErrorCategory = "BusinessRuleViolation";
        response.ErrorCode = "TimeSlotConflict";
        response.Message = "The requested time slot is already booked.";
    }
    else if (exception is InvalidOperationException ioe)
    {
        statusCode = HttpStatusCode.Conflict;
        response.ErrorCategory = "BusinessRuleViolation";
        response.ErrorCode = "InvalidState";
        response.Message = ioe.Message;  // ← Use the real message instead of hardcoding
        response.Details = "Operation not allowed in current state.";
    }
    else if (exception is ArgumentException argEx)
    {
        statusCode = HttpStatusCode.BadRequest;
        response.ErrorCategory = "ClientValidation";
        response.ErrorCode = "InvalidArgument";
        response.Message = argEx.Message;
        response.Details = "Check your request payload.";
    }

    context.Response.StatusCode = (int)statusCode;

    var result = JsonSerializer.Serialize(response, new JsonSerializerOptions { WriteIndented = true });
    return context.Response.WriteAsync(result);
}
}
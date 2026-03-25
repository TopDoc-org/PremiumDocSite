import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-booking-section',
  template: `
    <section id="booking" class="py-16 px-6 bg-gray-50">
      <div class="max-w-2xl mx-auto text-center">
        <h2 class="font-['Playfair_Display'] text-2xl font-bold mb-3 text-gray-900">
          {{ data?.heading || 'Book an Appointment' }}
        </h2>
        <p class="text-gray-500 mb-8">{{ data?.subheading || 'Choose a convenient time slot' }}</p>
        <!-- Booking widget will be implemented in the booking component task -->
        <div class="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p class="text-gray-400">Booking widget — coming soon</p>
        </div>
      </div>
    </section>
  `
})
export class BookingSectionComponent {
  @Input() data: any;
  @Input() doctorId!: string;
}

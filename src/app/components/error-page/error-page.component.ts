import { Component } from '@angular/core';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styles: [`
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #fff;
      text-align: center;
      padding: 2rem;
    }
    .error-code {
      font-size: 6rem;
      font-weight: 800;
      opacity: 0.2;
      margin-bottom: -1rem;
    }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    p { color: rgba(255,255,255,0.6); max-width: 400px; }
    .brand {
      margin-top: 3rem;
      font-size: 0.85rem;
      color: rgba(255,255,255,0.3);
    }
  `]
})
export class ErrorPageComponent {}
